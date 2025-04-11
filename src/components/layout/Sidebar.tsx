"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SidebarItem } from '@/types';
import { 
  PlusCircle, 
  Users, 
  FolderKanban, 
  MessageSquare, 
  BookOpen, 
  Image, 
  BarChart3, 
  Activity,
  ChevronDown
} from 'lucide-react';

// 侧边栏项目数据
const sidebarItems: SidebarItem[] = [
  {
    id: 'create_project',
    type: 'link',
    label: '创建项目',
    icon: 'PlusCircle',
    link: '/projects/create'
  },
  {
    id: 'create_role',
    type: 'link',
    label: '创建角色',
    icon: 'Users',
    link: '/role-center/create'
  },
  {
    id: 'my_projects',
    type: 'collection',
    label: '我的项目',
    icon: 'FolderKanban',
    link: '/projects'
  },
  {
    id: 'my_roles',
    type: 'collection',
    label: '我的角色',
    icon: 'Users',
    link: '/role-center'
  },
  {
    id: 'session_records',
    type: 'collection',
    label: '会话记录',
    icon: 'MessageSquare',
    link: '/sessions'
  },
  {
    id: 'knowledge_base',
    type: 'collection',
    label: '知识库',
    icon: 'BookOpen',
    link: '/knowledge'
  },
  {
    id: 'material_lib',
    type: 'collection',
    label: '素材库',
    icon: 'Image',
    link: '/materials'
  },
  {
    id: 'data_analytics',
    type: 'collection',
    label: '数据分析',
    icon: 'BarChart3',
    link: '/analytics'
  },
  {
    id: 'concurrency_mgr',
    type: 'collection',
    label: '并发管理',
    icon: 'Activity',
    link: '/concurrency'
  }
];

// 图标映射
const iconMap: Record<string, React.ReactNode> = {
  PlusCircle: <PlusCircle className="h-4 w-4" />,
  Users: <Users className="h-4 w-4" />,
  FolderKanban: <FolderKanban className="h-4 w-4" />,
  MessageSquare: <MessageSquare className="h-4 w-4" />,
  BookOpen: <BookOpen className="h-4 w-4" />,
  Image: <Image className="h-4 w-4" />,
  BarChart3: <BarChart3 className="h-4 w-4" />,
  Activity: <Activity className="h-4 w-4" />
};

export interface SidebarProps {
  currentModule?: string;
}

export function Sidebar({ currentModule }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const isExpanded = (id: string) => expandedItems.includes(id);
  const isActive = (path: string) => pathname === path || (currentModule && path.includes(currentModule));

  return (
    <div className="flex flex-col h-full w-52 bg-white border-r border-gray-100">
      <div className="p-3 border-b border-gray-100">
        <h2 className="text-sm font-medium text-gray-800">数字人平台</h2>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        <ul className="space-y-1 px-2">
          {sidebarItems.map((item) => (
            <li key={item.id}>
              {item.type === 'link' ? (
                <Link 
                  href={item.link || '#'}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors",
                    isActive(item.link || '') && "bg-gray-800 text-white font-medium"
                  )}
                >
                  {item.icon && iconMap[item.icon]}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <div>
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors",
                      isActive(item.link || '') && "bg-gray-800 text-white font-medium"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {item.icon && iconMap[item.icon]}
                      <span>{item.label}</span>
                    </div>
                    <ChevronDown 
                      className={cn(
                        "h-3.5 w-3.5 transition-transform",
                        isActive(item.link || '') ? "text-white" : "text-gray-400",
                        isExpanded(item.id) && "transform rotate-180"
                      )} 
                    />
                  </button>
                  {isExpanded(item.id) && item.items && (
                    <ul className="ml-6 mt-1 space-y-1">
                      {item.items.map((child) => (
                        <li key={child.id}>
                          <Link
                            href={child.link || '#'}
                            className={cn(
                              "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors",
                              isActive(child.link || '') && "bg-gray-800 text-white font-medium"
                            )}
                          >
                            {child.icon && iconMap[child.icon]}
                            <span>{child.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
} 