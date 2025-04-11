import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { signIn, generateToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: '邮箱和密码是必须的' },
        { status: 400 }
      );
    }

    const user = await signIn(email, password);

    if (!user) {
      return NextResponse.json(
        { message: '邮箱或密码不正确' },
        { status: 401 }
      );
    }

    const token = generateToken(user);

    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      status: user.status,
      avatar: user.avatar || null,
    };

    // 设置token cookie
    const cookieStore = cookies();
    cookieStore.set({
      name: 'token',
      value: token,
      httpOnly: false, // 客户端JavaScript需要访问
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30天
      path: '/',
      sameSite: 'lax',
    });

    console.log('登录成功，设置cookie和返回用户信息:', safeUser.username);

    // 创建响应对象
    const response = NextResponse.json(
      { 
        message: '登录成功', 
        user: safeUser,
        token
      },
      { 
        status: 200,
      }
    );

    return response;
  } catch (error) {
    console.error('登录请求处理错误:', error);
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    );
  }
}
