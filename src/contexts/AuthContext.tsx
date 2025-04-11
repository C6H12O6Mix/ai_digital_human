"use client";

import { createContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "sonner";
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

// 用户类型定义
export interface AuthUser {
  id: string;
  username: string;
  email: string | null;
  status: number;
  avatar?: string | null;
  lastLoginTime?: Date;
}

// 认证上下文类型定义
interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (username: string, email: string, password: string) => Promise<void>;
  checkAuth: () => boolean;
  fetchUserInfo: () => Promise<void>;
  checkAndRefreshAuth: () => Promise<boolean>;
}

// 创建认证上下文
export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: async () => false,
  logout: () => {},
  register: async () => {},
  checkAuth: () => false,
  fetchUserInfo: async () => {},
  checkAndRefreshAuth: async () => false,
});

// 检查是否在浏览器环境中运行
const isBrowser = typeof window !== 'undefined';

// 认证提供者组件
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();

  // 从API获取用户信息
  const fetchUserInfo = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('/api/auth/user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // 更新用户状态
        setUser(data.user);
        
        // 保存到本地存储
        if (isBrowser) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        return;
      }
      
      // 如果获取用户信息失败，清除登录状态
      setUser(null);
      setToken(null);
      
      if (isBrowser) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        Cookies.remove('token');
      }
      
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  };

  // 初始化加载用户信息
  useEffect(() => {
    const loadUserFromStorage = async () => {
      if (!isBrowser) {
        setLoading(false);
        setInitialized(true);
        return;
      }
      
      // 从localStorage获取用户信息
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      
      if (storedUser && storedToken) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          
          // 验证用户信息是否仍然有效
          try {
            const response = await fetch('/api/auth/user', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${storedToken}`,
              },
            });
            
            if (response.ok) {
              const data = await response.json();
              setUser(data.user);
              localStorage.setItem('user', JSON.stringify(data.user));
              console.log('已从服务器验证用户信息:', data.user.username);
            } else {
              // 如果验证失败，清除本地存储
              console.log('用户验证失败，清除本地信息');
              setUser(null);
              setToken(null);
              localStorage.removeItem('user');
              localStorage.removeItem('token');
              Cookies.remove('token');
            }
          } catch (fetchError) {
            console.error('验证用户信息出错:', fetchError);
            // 网络错误时，暂时保留本地信息，不做清除
          }
        } catch (parseError) {
          console.error('解析用户信息失败:', parseError);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          Cookies.remove('token');
          setUser(null);
          setToken(null);
        }
      } else {
        console.log('本地存储中没有找到用户信息');
      }
      
      setLoading(false);
      setInitialized(true);
    };

    loadUserFromStorage();
  }, []);

  // 检查用户是否已认证
  const checkAuth = (): boolean => {
    return !!user && !!token;
  };

  // 注册函数
  const register = async (username: string, email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '注册失败');
      }

      const data = await response.json();
      toast.success('注册成功！请登录您的账户');
      
      // 注册成功后跳转到登录页面
      if (isBrowser) {
        router.push('/login');
      }
      
      return data;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('注册过程中出现错误');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 登录函数 - 返回布尔值表示是否登录成功
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '登录失败');
      }

      const data = await response.json();
      console.log('登录成功，获取用户数据:', data.user.username);
      
      // 保存用户数据到状态
      setUser(data.user);
      setToken(data.token);
      
      // 保存用户数据到本地存储
      if (isBrowser) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        
        // 保存token到cookie
        Cookies.set('token', data.token, { expires: 30 }); // 30天过期
      }
      
      toast.success('登录成功');
      return true;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('登录出现错误');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 登出函数
  const logout = async () => {
    setLoading(true);
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('退出登录API调用失败:', error);
    } finally {
      // 无论API调用成功与否，都清除本地状态
      console.log('清除用户状态，执行登出');
      
      // 清除状态
      setUser(null);
      setToken(null);
      
      // 清除本地存储
      if (isBrowser) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        Cookies.remove('token');
      }
      
      toast.success('已成功登出');
      
      // 登出成功后重定向到登录页
      if (isBrowser) {
        router.push('/login');
      }
      
      setLoading(false);
    }
  };

  // 检查并刷新认证状态
  const checkAndRefreshAuth = async (): Promise<boolean> => {
    if (!isBrowser) return false;
    
    // 如果已有用户信息和令牌，直接返回
    if (user && token) return true;
    
    // 尝试从本地存储中恢复会话
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        // 设置本地存储的用户和令牌
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
        
        // 验证用户信息是否有效
        const response = await fetch('/api/auth/user', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${storedToken}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
          console.log('已刷新验证用户信息:', data.user.username);
          return true;
        } else {
          // 验证失败，清除本地存储
          console.log('用户验证失败，清除本地信息');
          setUser(null);
          setToken(null);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          Cookies.remove('token');
          return false;
        }
      } catch (error) {
        console.error('验证用户信息出错:', error);
        return false;
      }
    }
    
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading: loading || !initialized,
        login,
        logout,
        register,
        checkAuth,
        fetchUserInfo,
        checkAndRefreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
