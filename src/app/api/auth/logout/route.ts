import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // 清除token cookie
    const cookieStore = cookies();
    cookieStore.delete('token');
    
    console.log('登出成功，已清除token cookie');

    return NextResponse.json(
      { message: '登出成功' },
      { status: 200 }
    );
  } catch (error) {
    console.error('登出请求处理错误:', error);
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    );
  }
}
