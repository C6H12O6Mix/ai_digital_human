import { NextRequest, NextResponse } from "next/server";
import { NodeConfig, GlobalConfig } from "@/types";

// 模拟数据库存储
let nodeConfigs: Record<string, NodeConfig> = {};
let globalConfigs: Record<string, GlobalConfig> = {};

// 创建默认节点配置
function createDefaultNodeConfig(projectId: string): NodeConfig {
  return {
    id: `default-node-${Date.now()}`,
    projectId,
    background: {
      source: "system",
    },
    uiComponents: {
      elements: [
        {
          id: "default-button-1",
          type: "button",
          position: { x: 100, y: 100 },
          properties: {
            text: "开始对话",
            color: "#1890ff",
          },
        },
      ],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// 创建默认全局配置
function createDefaultGlobalConfig(projectId: string): GlobalConfig {
  return {
    id: `default-global-${Date.now()}`,
    projectId,
    digitalHuman: {
      modelConfig: {
        videoSources: {
          updateStrategy: "version_control",
        },
        tts: {
          voiceLib: {
            api: "https://api.example.com/tts",
            rate: {
              min: 0.5,
              max: 2.0,
            },
          },
          emotionMapping: {
            happy: 1,
            sad: 2,
          },
        },
      },
    },
    interaction: {
      defaultMode: "voice",
      voiceControl: {
        type: "hold_to_talk",
      },
      wakeup: {
        methods: ["voice_keyword"],
        sensitivity: {
          level: 1,
          threshold: 0.8,
        },
      },
      interrupt: {
        phrases: ["打断", "暂停"],
        clearDelay: {
          min: 1000,
          max: 5000,
          default: 2000,
        },
      },
    },
    sleepMode: {
      activation: {
        timeout: 300000,
        phrases: ["再见", "拜拜"],
      },
      wakeup: {
        phrases: ["你好", "在吗"],
        retryLimit: 3,
      },
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// 获取节点配置
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const projectId = params.id;
  
  // 获取查询参数
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type");
  
  if (type === "node") {
    // 如果节点配置不存在，创建默认配置
    if (!nodeConfigs[projectId]) {
      nodeConfigs[projectId] = createDefaultNodeConfig(projectId);
      console.log(`为项目 ${projectId} 创建默认节点配置`);
    }
    
    return NextResponse.json(nodeConfigs[projectId]);
  } else if (type === "global") {
    // 如果全局配置不存在，创建默认配置
    if (!globalConfigs[projectId]) {
      globalConfigs[projectId] = createDefaultGlobalConfig(projectId);
      console.log(`为项目 ${projectId} 创建默认全局配置`);
    }
    
    return NextResponse.json(globalConfigs[projectId]);
  } else {
    return NextResponse.json(
      { error: "无效的配置类型" },
      { status: 400 }
    );
  }
}

// 保存节点配置
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const projectId = params.id;
  
  try {
    const body = await request.json();
    const { type, config } = body;
    
    if (!type || !config) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      );
    }
    
    if (type === "node") {
      // 验证节点配置
      const nodeConfig = config as NodeConfig;
      if (!nodeConfig.background || !nodeConfig.uiComponents) {
        return NextResponse.json(
          { error: "节点配置格式不正确" },
          { status: 400 }
        );
      }
      
      // 保存节点配置
      nodeConfigs[projectId] = {
        ...nodeConfig,
        projectId,
        updatedAt: new Date(),
      };
      
      return NextResponse.json({ success: true, config: nodeConfigs[projectId] });
    } else if (type === "global") {
      // 验证全局配置
      const globalConfig = config as GlobalConfig;
      if (!globalConfig.digitalHuman || !globalConfig.interaction || !globalConfig.sleepMode) {
        return NextResponse.json(
          { error: "全局配置格式不正确" },
          { status: 400 }
        );
      }
      
      // 保存全局配置
      globalConfigs[projectId] = {
        ...globalConfig,
        projectId,
        updatedAt: new Date(),
      };
      
      return NextResponse.json({ success: true, config: globalConfigs[projectId] });
    } else {
      return NextResponse.json(
        { error: "无效的配置类型" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("保存配置失败:", error);
    return NextResponse.json(
      { error: "保存配置失败" },
      { status: 500 }
    );
  }
} 