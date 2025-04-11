import { NodeConfig, GlobalConfig } from "@/types";

// 获取存储的认证令牌
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

// 获取节点配置
export async function getNodeConfig(projectId: string): Promise<NodeConfig> {
  const token = getAuthToken();
  const response = await fetch(`/api/projects/${projectId}/config?type=node`, {
    headers: {
      "Authorization": token ? `Bearer ${token}` : '',
    }
  });
  
  if (response.status === 401) {
    throw new Error('authentication_required');
  }
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "获取节点配置失败");
  }
  
  return response.json();
}

// 保存节点配置
export async function saveNodeConfig(projectId: string, config: NodeConfig): Promise<NodeConfig> {
  const token = getAuthToken();
  const response = await fetch(`/api/projects/${projectId}/config`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify({
      type: "node",
      config,
    }),
  });
  
  if (response.status === 401) {
    throw new Error('authentication_required');
  }
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "保存节点配置失败");
  }
  
  const result = await response.json();
  return result.config;
}

// 获取全局配置
export async function getGlobalConfig(projectId: string): Promise<GlobalConfig> {
  const token = getAuthToken();
  const response = await fetch(`/api/projects/${projectId}/config?type=global`, {
    headers: {
      "Authorization": token ? `Bearer ${token}` : '',
    }
  });
  
  if (response.status === 401) {
    throw new Error('authentication_required');
  }
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "获取全局配置失败");
  }
  
  return response.json();
}

// 保存全局配置
export async function saveGlobalConfig(projectId: string, config: GlobalConfig): Promise<GlobalConfig> {
  const token = getAuthToken();
  const response = await fetch(`/api/projects/${projectId}/config`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify({
      type: "global",
      config,
    }),
  });
  
  if (response.status === 401) {
    throw new Error('authentication_required');
  }
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "保存全局配置失败");
  }
  
  const result = await response.json();
  return result.config;
} 