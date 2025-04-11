"use client";

import { Layout } from "@/components/layout/Layout"
import { Button } from "@/components/ui/button"
import { ProjectCard } from "@/components/project/ProjectCard"
import Link from "next/link"
import { Project } from "@/types"
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

// 模拟项目数据
const mockProjects: Project[] = [
  {
    id: "1",
    name: "智能客服助手",
    description: "基于AI的智能客服系统，可以自动回答客户问题",
    orientation: 0,
    status: "active",
    createdAt: new Date("2024-04-01"),
    updatedAt: new Date("2024-04-01")
  },
  {
    id: "2", 
    name: "销售顾问",
    description: "专业的销售顾问数字人，帮助客户了解产品",
    orientation: 0,
    status: "active",
    createdAt: new Date("2024-04-02"),
    updatedAt: new Date("2024-04-02")
  },
  {
    id: "3",
    name: "教育辅导老师",
    description: "个性化的教育辅导数字人，帮助学生提高学习效率",
    orientation: 1,
    status: "active", 
    createdAt: new Date("2024-04-03"),
    updatedAt: new Date("2024-04-03")
  }
]

export default function ProjectsPage() {
  const { user, checkAuth, loading, fetchUserInfo } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  
  // 在组件加载时进行认证检查
  useEffect(() => {
    const checkAuthentication = async () => {
      if (!checkAuth()) {
        // 尝试从服务器获取用户信息
        await fetchUserInfo();
        
        // 如果仍然没有用户信息，且未尝试过重定向，则重定向到登录页面
        if (!checkAuth() && !redirectAttempted) {
          setRedirectAttempted(true);
          console.log('用户未登录，重定向到登录页');
          toast.error('未登录或会话已过期，请重新登录');
          setTimeout(() => {
            window.location.replace('/login');
          }, 1000);
          return;
        }
      } else {
        console.log('用户已认证，显示项目页面:', user?.username);
      }
      
      setIsLoading(false);
    };
    
    if (!loading) {
      checkAuthentication();
    }
  }, [checkAuth, fetchUserInfo, loading, redirectAttempted, user]);
  
  // 如果正在加载或未认证，显示加载状态
  if (loading || isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[80vh]">
          <div className="text-lg">加载中...</div>
        </div>
      </Layout>
    );
  }
  
  // 如果没有用户且已尝试重定向，显示提示
  if (!user && redirectAttempted) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[80vh]">
          <div className="text-lg">未登录，正在跳转到登录页...</div>
        </div>
      </Layout>
    );
  }

  const handleEdit = (project: Project) => {
    console.log("编辑项目:", project)
  }

  const handleDelete = (project: Project) => {
    console.log("删除项目:", project)
  }

  const handlePlay = (project: Project) => {
    console.log("播放项目:", project)
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">我的项目</h1>
        <Link href="/projects/create">
          <Button>创建项目</Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPlay={handlePlay}
          />
        ))}
      </div>
    </Layout>
  )
} 