"use client";

import { RegisterForm } from '@/components/auth/RegisterForm';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const { user, checkAuth, register } = useAuth();

  // 如果用户已登录，重定向到项目页面
  useEffect(() => {
    if (checkAuth()) {
      router.push('/projects');
    }
  }, [checkAuth, router]);

  const handleRegister = async (username: string, email: string, password: string) => {
    try {
      await register(username, email, password);
      router.push('/login');
    } catch (error) {
      console.error('注册失败:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-3xl font-bold text-primary">AI</span>
          </div>
          <h1 className="mt-4 text-3xl font-bold">AI数字人平台</h1>
          <p className="mt-2 text-gray-500">创建您的账户</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>注册</CardTitle>
            <CardDescription>
              创建一个新账户以访问AI数字人平台
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm onSubmit={handleRegister} />
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-muted-foreground">
              已有账户？ <Link href="/login" className="text-primary hover:underline">登录</Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 