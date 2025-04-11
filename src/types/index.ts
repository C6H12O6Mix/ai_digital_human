// 用户相关类型
export interface User {
  id: string;
  username: string;
  email: string | null;
  status: 'active' | 'inactive' | 'suspended' | number;
  avatar?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// 项目相关类型
export interface Project {
  id: string;
  name: string;
  description: string;
  orientation: 0 | 1; // 0-横版, 1-竖版
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

// 场景相关类型
export interface Scene {
  id: string;
  projectId: string;
  name: string;
  description: string;
  type: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

// 数字人相关类型
export interface DigitalHuman {
  id: string;
  projectId: string;
  name: string;
  description: string;
  avatar: string;
  voice: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

// 声音库相关类型
export interface VoiceLibrary {
  id: string;
  name: string;
  description: string;
  type: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

// 知识库相关类型
export interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  type: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

// 角色相关类型
export interface Role {
  id: string;
  name: string;
  description: string;
  type: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

// 工具配置相关类型
export interface ToolConfig {
  id: string;
  name: string;
  description: string;
  type: string;
  config: Record<string, any>;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

// 模型配置相关类型
export interface ModelSettings {
  id: string;
  projectId: string;
  modelType: string;
  modelName: string;
  parameters: Record<string, any>;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

// 知识库配置相关类型
export interface KnowledgeBaseSettings {
  id: string;
  projectId: string;
  knowledgeBaseId: string;
  settings: Record<string, any>;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

// 语音配置相关类型
export interface SpeechSettings {
  id: string;
  projectId: string;
  voiceId: string;
  settings: Record<string, any>;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

// 用户素材相关类型
export interface UserAsset {
  id: string;
  userId: string;
  type: "material" | "knowledge" | "concurrency";
  used: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

// 会话相关类型
export interface Conversation {
  id: string;
  projectId: string;
  userId: string;
  content: string;
  type: "text" | "voice" | "video";
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

// 使用统计相关类型
export interface UsageStatistics {
  id: string;
  projectId: string;
  type: string;
  count: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 操作日志相关类型
export interface OperationLog {
  id: string;
  userId: string;
  action: string;
  target: string;
  details: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// 导航相关类型
export interface SidebarItem {
  id: string;
  type: "link" | "collection";
  label: string;
  icon: string;
  link?: string;
  items?: SidebarItem[];
}

// 用户面板相关类型
export interface UserPanel {
  user: User;
  quota: {
    material: {
      used: number;
      total: number;
      alertThreshold: number;
    };
    knowledge: {
      used: number;
      total: number;
      alertThreshold: number;
    };
    concurrency: {
      used: number;
      max: number;
    };
  };
}

// 项目配置相关类型
export interface ProjectConfig {
  id: string;
  projectId: string;
  settings: Record<string, any>;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

// 节点配置相关类型
export interface NodeConfig {
  id: string;
  projectId: string;
  background: {
    source: string;
    url?: string;
    color?: string;
  };
  uiComponents: {
    elements: Array<{
      id: string;
      type: string;
      position: { x: number; y: number };
      properties: Record<string, any>;
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
}

// UI元素相关类型
export interface UIElement {
  id: string;
  type: "button" | "text_field" | "media_player";
  position: {
    x: number;
    y: number;
  };
  properties: Record<string, any>;
}

// 全局配置相关类型
export interface GlobalConfig {
  id: string;
  projectId: string;
  digitalHuman: {
    modelConfig: {
      videoSources: {
        updateStrategy: string;
      };
      tts: {
        voiceLib: {
          api: string;
          rate: {
            min: number;
            max: number;
          };
        };
        emotionMapping: Record<string, number>;
      };
    };
  };
  interaction: {
    defaultMode: string;
    voiceControl: {
      type: string;
    };
    wakeup: {
      methods: string[];
      sensitivity: {
        level: number;
        threshold: number;
      };
    };
    interrupt: {
      phrases: string[];
      clearDelay: {
        min: number;
        max: number;
        default: number;
      };
    };
  };
  sleepMode: {
    activation: {
      timeout: number;
      phrases: string[];
    };
    wakeup: {
      phrases: string[];
      retryLimit: number;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

// 角色商城相关类型
export interface RoleMall {
  id: string;
  name: string;
  description: string;
  type: string;
  price: number;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

// 分析相关类型
export interface Analytics {
  id: string;
  projectId: string;
  type: string;
  data: Record<string, any>;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 并发控制相关类型
export interface ConcurrencyToken {
  id: string;
  projectId: string;
  token: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}