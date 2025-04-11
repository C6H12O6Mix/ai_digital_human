import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 不需要认证的路由
const publicRoutes = [
  '/login', 
  '/register', 
  '/forgot-password', 
  '/api/auth/login', 
  '/api/auth/register',
  '/api/auth/logout',
  '/api/auth/user'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 如果是公共路由，直接放行
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // 如果是静态资源或Next.js内部路由，直接放行
  if (pathname.includes('/_next') || pathname.includes('/favicon.ico')) {
    return NextResponse.next();
  }
  
  // 对于API路由，检查Authorization头
  if (pathname.startsWith('/api')) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: '未授权访问' }, { status: 401 });
    }
    
    return NextResponse.next();
  }
  
  // 对于页面路由，只检查token是否存在
  const token = request.cookies.get('token')?.value;
  
  // 如果没有令牌，重定向到登录页面
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // 允许访问
  return NextResponse.next();
}

// 配置中间件适用的路由
export const config = {
  matcher: [
    // 排除静态资源和一些特定路径
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
