import { NextResponse } from 'next/server';
import { signUp } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password } = body;

    // 验证必填字段
    if (!username || !email || !password) {
      return NextResponse.json(
        { message: '用户名、邮箱和密码都是必填项' },
        { status: 400 }
      );
    }

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json(
        { message: '密码必须至少包含6个字符' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: '请提供有效的电子邮件地址' },
        { status: 400 }
      );
    }

    // 尝试注册用户
    const newUser = await signUp(username, email, password);

    if (!newUser) {
      return NextResponse.json(
        { message: '注册失败，可能是邮箱已被使用' },
        { status: 409 }
      );
    }

    // 注册成功，返回用户信息（不包含密码）
    const safeUser = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      status: newUser.status,
    };

    return NextResponse.json(
      { 
        message: '注册成功', 
        user: safeUser 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('注册请求处理错误:', error);
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    );
  }
} 