"use client";

import { Layout } from "@/components/layout/Layout"
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const router = useRouter();
  const { user, checkAuth } = useAuth();

  useEffect(() => {
    // 检查用户是否已登录，如果已登录则重定向到项目页面
    if (checkAuth()) {
      router.push('/projects');
    } else {
      router.push('/login');
    }
  }, [router, checkAuth]);

  // 仅作为过渡页面，可能不会被显示
  return (
    <Layout>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-4">
          <h2 className="text-lg font-semibold">快速开始</h2>
          <p className="text-sm text-muted-foreground">
            创建您的第一个AI数字人项目
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <h2 className="text-lg font-semibold">项目统计</h2>
          <p className="text-sm text-muted-foreground">
            查看您的项目使用情况
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <h2 className="text-lg font-semibold">系统公告</h2>
          <p className="text-sm text-muted-foreground">
            了解最新的系统更新和功能
          </p>
        </div>
      </div>
    </Layout>
  )
} 