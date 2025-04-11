"use client";

import { LoginForm } from '@/components/auth/LoginForm';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login, checkAuth, loading, user } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  const router = useRouter();

  // 如果用户已登录，重定向到项目页面
  useEffect(() => {
    // 防止循环重定向，只尝试重定向一次
    if (!redirectAttempted && !loading && checkAuth() && user) {
      setRedirectAttempted(true);
      console.log('用户已登录，重定向到项目页面:', user.username);
      // 使用router.push进行导航
      router.push('/projects');
    }
  }, [checkAuth, loading, user, redirectAttempted, router]);

  const handleLogin = async (email: string, password: string) => {
    try {
      setIsLoggingIn(true);
      // 登录成功返回true，然后进行重定向
      const success = await login(email, password);
      if (success) {
        // 登录成功后使用router进行导航
        router.push('/projects');
      }
    } catch (error) {
      console.error('登录失败:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // 如果已经登录且正在进行重定向，显示加载状态
  if (!loading && checkAuth() && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">已登录，正在跳转...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-3xl font-bold text-primary">AI</span>
          </div>
          <h1 className="mt-4 text-3xl font-bold">AI数字人平台</h1>
          <p className="mt-2 text-gray-500">登录您的账户</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>登录</CardTitle>
            <CardDescription>
              输入您的凭据以访问您的账户
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm onSubmit={handleLogin} />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-muted-foreground">
              没有账户？ <Link href="/register" className="text-primary hover:underline">注册</Link>
            </div>
            <div className="text-sm text-muted-foreground">
              <Link href="/forgot-password" className="text-primary hover:underline">忘记密码?</Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
