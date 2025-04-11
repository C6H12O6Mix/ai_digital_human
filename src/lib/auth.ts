// src/lib/auth.ts 

import { User } from "@prisma/client";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// JWT密钥，在生产环境中应该放在环境变量中
const JWT_SECRET = "ai_digital_human_secret_key_2024";
// 令牌过期时间 (30天)
const JWT_EXPIRES_IN = "30d";

// 定义JWT载荷类型
interface JwtPayload {
  id: string;
  email: string | null;
  username: string;
  iat: number;
  exp: number;
}

// 验证密码
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// 哈希密码
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// 登录用户
export async function signIn(email: string, password: string): Promise<User | null> {
  try {
    console.log(`[Auth] 尝试登录用户: ${email}`);
    
    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`[Auth] 用户不存在: ${email}`);
      return null;
    }

    // 验证密码
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      console.log(`[Auth] 密码验证失败: ${email}`);
      return null;
    }

    // 更新最后登录时间
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginTime: new Date() },
    });

    console.log(`[Auth] 用户登录成功: ${email}, ID: ${user.id}`);
    return user;
  } catch (error) {
    console.error(`[Auth] 登录出错: ${email}`, error);
    return null;
  }
}

// 注册新用户
export async function signUp(username: string, email: string, password: string): Promise<User | null> {
  try {
    console.log(`[Auth] 尝试注册新用户: ${email}`);
    
    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`[Auth] 邮箱已被使用: ${email}`);
      return null; // 邮箱已被使用
    }

    // 哈希密码
    const hashedPassword = await hashPassword(password);

    // 创建新用户
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        status: 1, // 假设1是活跃状态
      },
    });

    console.log(`[Auth] 用户注册成功: ${email}, ID: ${newUser.id}`);
    return newUser;
  } catch (error) {
    console.error(`[Auth] 注册出错: ${email}`, error);
    return null;
  }
}

// 格式化用户数据，移除敏感信息
export function formatUserForClient(user: User): Omit<User, "password"> {
  // 移除密码字段
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// 生成JWT令牌
export function generateToken(user: User): string {
  const payload = {
    id: user.id,
    email: user.email,
    username: user.username,
    // 添加令牌创建时间
    iat: Math.floor(Date.now() / 1000),
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  console.log(`[Auth] 生成令牌成功: 用户ID ${user.id}, 令牌前缀: ${token.substring(0, 10)}...`);
  return token;
}

// 验证JWT令牌
export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error: any) {
    console.error('[Auth] 令牌验证失败:', error.message);
    return null;
  }
}

// 从请求中获取用户
export async function getUserFromRequest(request: Request): Promise<User | null> {
  // 从请求头获取令牌
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log('[Auth] 请求无Authorization头或格式不正确');
    return null;
  }

  // 提取令牌
  const token = authHeader.slice(7);
  console.log(`[Auth] 从请求头中提取令牌: ${token.substring(0, 10)}...`);
  
  // 验证令牌
  const decoded = verifyToken(token);
  if (!decoded || !decoded.id) {
    console.log('[Auth] 无效或过期的令牌');
    return null;
  }

  // 查找用户
  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });
    if (!user) {
      console.log(`[Auth] 找不到令牌对应的用户: ID ${decoded.id}`);
    } else {
      console.log(`[Auth] 已找到用户: ID ${user.id}, 用户名 ${user.username}`);
    }
    return user;
  } catch (error) {
    console.error('[Auth] 获取用户出错:', error);
    return null;
  }
} 
