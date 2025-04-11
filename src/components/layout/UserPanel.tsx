"use client";

import React, { useState } from 'react';
import { User, UserPanel as UserPanelType } from '@/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { LogOut, Settings, User as UserIcon, HardDrive, Database, Users } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface UserPanelProps {
  userPanel?: UserPanelType;
  onLogout?: () => void;
  onSwitchUser?: () => void;
  onChangePassword?: () => void;
}

export function UserPanel({ 
  userPanel = { 
    user: { 
      id: 'guest-id', 
      username: 'Guest', 
      email: 'guest@example.com', 
      status: 'active' as const, 
      createdAt: new Date(), 
      updatedAt: new Date() 
    }, 
    quota: { 
      material: { used: 0, total: 100, alertThreshold: 90 },
      knowledge: { used: 0, total: 100, alertThreshold: 90 },
      concurrency: { used: 0, max: 10 }
    } 
  }, 
  onLogout = () => {}, 
  onSwitchUser = () => {}, 
  onChangePassword = () => {} 
}: UserPanelProps) {
  // 防止userPanel为undefined
  if (!userPanel) return null;
  
  const { user, quota } = userPanel;
  
  // 计算使用百分比
  const materialUsagePercent = Math.round((quota.material.used / quota.material.total) * 100);
  const knowledgeUsagePercent = Math.round((quota.knowledge.used / quota.knowledge.total) * 100);
  const concurrencyUsagePercent = Math.round((quota.concurrency.used / quota.concurrency.max) * 100);

  // 格式化文件大小
  const formatFileSize = (size: number): string => {
    if (size < 1024) return `${size}B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)}MB`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)}GB`;
  };

  return (
    <div className="flex items-center">
      <TooltipProvider>
        <div className="flex flex-col items-end gap-0.5 mr-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
                <HardDrive className="h-3 w-3 text-gray-400" />
                <Progress value={materialUsagePercent} max={100} className="h-1 w-16 bg-gray-100" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p className="text-xs">素材: {formatFileSize(quota.material.used)}/{formatFileSize(quota.material.total)}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
                <Database className="h-3 w-3 text-gray-400" />
                <Progress value={knowledgeUsagePercent} max={100} className="h-1 w-16 bg-gray-100" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p className="text-xs">知识库: {formatFileSize(quota.knowledge.used)}/{formatFileSize(quota.knowledge.total)}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-gray-400" />
                <Progress value={concurrencyUsagePercent} max={100} className="h-1 w-16 bg-gray-100" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p className="text-xs">并发: {quota.concurrency.used}/{quota.concurrency.max}实例</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 gap-2 text-sm font-normal text-gray-700 hover:bg-gray-100">
            <span>{user.username}</span>
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs bg-gray-200 text-gray-700">{user.username[0]}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-52" align="end">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.username}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onSwitchUser} className="text-sm">
            <UserIcon className="mr-2 h-4 w-4" />
            <span>切换账号</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onChangePassword} className="text-sm">
            <Settings className="mr-2 h-4 w-4" />
            <span>修改密码</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onLogout} className="text-sm text-red-500 focus:text-red-500">
            <LogOut className="mr-2 h-4 w-4" />
            <span>退出登录</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 