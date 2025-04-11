"use client";

import React from "react"
import { Sidebar } from "@/components/layout/Sidebar"
import { UserPanel } from "@/components/layout/UserPanel"
import { Toaster } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { UserPanel as UserPanelType } from "@/types"

export interface LayoutProps {
  children: React.ReactNode
  title?: string
  currentModule?: string
}

export function Layout({ 
  children, 
  title = '数字人创作平台', 
  currentModule
}: LayoutProps) {
  const { user, logout, checkAuth } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleSwitchUser = () => {
    logout();
    router.push('/login');
  };

  const handleChangePassword = () => {
    router.push('/change-password');
  };

  const userPanelData: UserPanelType | undefined = user ? {
    user: {
      id: user.id,
      username: user.username,
      email: user.email || "未设置邮箱",
      status: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    quota: {
      material: { used: 1024 * 1024 * 1024, total: 2 * 1024 * 1024 * 1024, alertThreshold: 90 },
      knowledge: { used: 512 * 1024 * 1024, total: 2 * 1024 * 1024 * 1024, alertThreshold: 90 },
      concurrency: { used: 3, max: 10 }
    }
  } : undefined;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Toaster position="top-right" />
      <Sidebar currentModule={currentModule} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex justify-between items-center h-14 border-b bg-white px-4">
          <div className="text-lg font-medium text-gray-800">
            {title}
          </div>
          {user && (
            <UserPanel 
              userPanel={userPanelData}
              onLogout={handleLogout}
              onSwitchUser={handleSwitchUser}
              onChangePassword={handleChangePassword}
            />
          )}
        </header>
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>
    </div>
  )
} 