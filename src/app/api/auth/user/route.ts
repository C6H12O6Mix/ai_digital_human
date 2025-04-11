import { NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // 获取并验证token
    const cookieToken = cookies().get('token')?.value;
    const authHeader = request.headers.get('authorization');
    let token = '';
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else if (cookieToken) {
      token = cookieToken;
    } else {
      return NextResponse.json(
        { message: '未授权访问' },
        { status: 401 }
      );
    }
    
    // 验证令牌
    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return NextResponse.json(
        { message: '无效或过期的令牌' },
        { status: 401 }
      );
    }
    
    // 根据令牌中的用户ID获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        email: true,
        status: true,
        avatar: true,
        lastLoginTime: true
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { message: '找不到用户' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { user },
      { status: 200 }
    );
  } catch (error) {
    console.error('获取用户信息出错:', error);
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    );
  }
} 