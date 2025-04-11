"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NodeConfigForm } from "@/components/project/NodeConfigForm";
import { GlobalConfigForm } from "@/components/project/GlobalConfigForm";
import { ConfigPreview } from "@/components/project/ConfigPreview";
import { ConfigImportExport } from "@/components/project/ConfigImportExport";
import { ConfigVersionControl } from "@/components/project/ConfigVersionControl";
import { NodeConfig, GlobalConfig, UIElement } from "@/types";
import { getNodeConfig, saveNodeConfig, getGlobalConfig, saveGlobalConfig } from "@/services/configService";
import { toast } from "sonner";
import { Loader2, Save, ArrowLeft, Sliders, Eye, Monitor, Settings2, ChevronRight, ImageIcon, InfoIcon, PlusCircle, Trash, Layout as LayoutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { TabItem } from "@/components/project/TabItem";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BackgroundUploader } from "@/components/project/BackgroundUploader";
import { useAuth } from "@/hooks/useAuth";

// 扩展NodeConfig类型，添加可选的name和description属性
interface ExtendedNodeConfig extends NodeConfig {
  name?: string;
  description?: string;
}

// 定义服务错误接口
interface ServiceError extends Error {
  message: string;
}

export default function ProjectConfigPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [activeTab, setActiveTab] = useState("node");
  const [nodeConfigs, setNodeConfigs] = useState<ExtendedNodeConfig[]>([]);
  const [selectedNodeIndex, setSelectedNodeIndex] = useState(0);
  const [nodeConfig, setNodeConfig] = useState<ExtendedNodeConfig | null>(null);
  const [globalConfig, setGlobalConfig] = useState<GlobalConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [activeConfigTab, setActiveConfigTab] = useState("basic");
  const router = useRouter();
  const { checkAndRefreshAuth } = useAuth();

  // 加载配置数据
  useEffect(() => {
    const loadConfigs = async () => {
      try {
        setLoading(true);
        
        // 先检查认证状态
        const authValid = await checkAndRefreshAuth();
        if (!authValid) {
          // 未登录，跳转到登录页
          router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
          return;
        }
        
        // 加载节点配置
        try {
          const nodeData = await getNodeConfig(projectId);
          
          // 模拟多个节点配置
          const multiNodeConfigs = [
            nodeData,
            { ...nodeData, id: "node-2", background: { ...nodeData.background, source: "system" } },
            { ...nodeData, id: "node-3", background: { ...nodeData.background, source: "custom", url: "/images/background-2.jpg" } },
          ] as ExtendedNodeConfig[];
          
          setNodeConfigs(multiNodeConfigs);
          setNodeConfig(multiNodeConfigs[0]);
        } catch (error) {
          const serviceError = error as ServiceError;
          if (serviceError.message === 'authentication_required') {
            // 已在服务中处理重定向
            return;
          }
          // 显示错误提示，提供重试选项
          toast.error("加载节点配置失败，请重试", {
            action: {
              label: "重试",
              onClick: () => loadConfigs()
            }
          });
        }
        
        // 加载全局配置
        try {
          const globalData = await getGlobalConfig(projectId);
          setGlobalConfig(globalData);
        } catch (error) {
          console.error("加载全局配置失败:", error);
          // 使用默认全局配置
          setGlobalConfig({
            id: "",
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
          });
        }
      } catch (error) {
        console.error("加载配置失败:", error);
        toast.error("加载配置失败");
      } finally {
        setLoading(false);
      }
    };
    
    loadConfigs();
  }, [projectId, checkAndRefreshAuth, router]);

  const handleSaveNodeConfig = async (config: ExtendedNodeConfig) => {
    try {
      setSaving(true);
      const savedConfig = await saveNodeConfig(projectId, config);
      
      // 更新当前节点配置并刷新节点列表
      const updatedNodeConfigs = [...nodeConfigs];
      updatedNodeConfigs[selectedNodeIndex] = savedConfig;
      
      setNodeConfigs(updatedNodeConfigs);
      setNodeConfig(savedConfig);
      toast.success("节点配置保存成功");
    } catch (error) {
      console.error("保存节点配置失败:", error);
      toast.error("保存节点配置失败");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGlobalConfig = async (config: GlobalConfig) => {
    try {
      setSaving(true);
      const savedConfig = await saveGlobalConfig(projectId, config);
      setGlobalConfig(savedConfig);
      toast.success("全局配置保存成功");
    } catch (error) {
      console.error("保存全局配置失败:", error);
      toast.error("保存全局配置失败");
    } finally {
      setSaving(false);
    }
  };

  // 处理选择节点
  const handleSelectNode = (index: number) => {
    setSelectedNodeIndex(index);
    setNodeConfig(nodeConfigs[index]);
  };

  // 处理导入节点配置
  const handleImportNodeConfig = (config: ExtendedNodeConfig) => {
    // 确保配置有正确的projectId
    const updatedConfig = {
      ...config,
      projectId,
      updatedAt: new Date(),
    };
    
    // 更新当前选择的节点配置
    const updatedNodeConfigs = [...nodeConfigs];
    updatedNodeConfigs[selectedNodeIndex] = updatedConfig;
    
    setNodeConfigs(updatedNodeConfigs);
    setNodeConfig(updatedConfig);
    toast.success("节点配置已导入，请点击保存按钮保存到服务器");
  };

  // 处理导入全局配置
  const handleImportGlobalConfig = (config: GlobalConfig) => {
    // 确保配置有正确的projectId
    const updatedConfig = {
      ...config,
      projectId,
      updatedAt: new Date(),
    };
    
    setGlobalConfig(updatedConfig);
    toast.success("全局配置已导入，请点击保存按钮保存到服务器");
  };

  // 处理恢复版本
  const handleRestoreVersion = (nodeConfig: ExtendedNodeConfig, globalConfig: GlobalConfig) => {
    // 更新当前节点配置
    const updatedNodeConfigs = [...nodeConfigs];
    updatedNodeConfigs[selectedNodeIndex] = nodeConfig as ExtendedNodeConfig;
    
    setNodeConfigs(updatedNodeConfigs);
    setNodeConfig(nodeConfig as ExtendedNodeConfig);
    setGlobalConfig(globalConfig);
    toast.success("已恢复到选择的版本");
  };

  // 处理保存版本
  const handleSaveVersion = async (nodeConfig: ExtendedNodeConfig, globalConfig: GlobalConfig, description: string) => {
    try {
      setSaving(true);
      await saveNodeConfig(projectId, nodeConfig);
      await saveGlobalConfig(projectId, globalConfig);
      toast.success("版本保存成功");
    } catch (error) {
      console.error("保存版本失败:", error);
      toast.error("保存版本失败");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-full mx-auto p-4">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">加载配置中...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="项目配置" currentModule="projects">
      <div className="h-full flex flex-col">
        {/* 主标题栏 */}
        <div className="flex items-center px-4 py-2 border-b bg-gray-50">
          <Link href="/projects">
            <Button variant="ghost" size="icon" className="h-8 w-8 mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-medium text-gray-800">项目配置</h1>
        </div>

        {/* 主要内容区域 */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full">
            <div className="flex h-full">
              {/* 左侧节点列表 */}
              <div className="w-48 border-r bg-gray-50 overflow-y-auto">
                <div className="p-3">
                  <h3 className="text-sm font-medium">节点列表</h3>
                </div>
                <div className="space-y-1 p-2">
                  {nodeConfigs.map((node, index) => (
                    <div
                      key={node.id}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100",
                        selectedNodeIndex === index && "bg-gray-200 border-gray-300 text-gray-800"
                      )}
                      onClick={() => handleSelectNode(index)}
                    >
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                        {node.background.source === "custom" && node.background.url ? (
                          <img
                            src={node.background.url}
                            alt={`节点 ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon size={16} className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">节点 {index + 1}</div>
                        <div className="text-xs text-gray-500 truncate">{node.id}</div>
                      </div>
                      {selectedNodeIndex === index && (
                        <ChevronRight className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 右侧内容区域 */}
              <div className="flex-1 overflow-hidden">
                {nodeConfig && (
                  <div className="h-full flex">
                    {/* 节点配置预览 */}
                    <div className="flex-1 border-r overflow-hidden flex flex-col">
                      <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
                        <h3 className="text-sm font-medium flex items-center gap-2">
                          <Monitor className="h-4 w-4" />
                          节点配置预览
                        </h3>
                        <Button variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)}>
                          <Eye className="h-4 w-4 mr-1" />
                          {showPreview ? "隐藏详情" : "显示详情"}
                        </Button>
                      </div>
                      <div className="flex-1 p-4 overflow-auto">
                        <div className="relative w-full h-[500px] border rounded-lg overflow-hidden bg-gray-100">
                          {/* 背景 */}
                          <div 
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ 
                              backgroundImage: nodeConfig.background.source === "system" 
                                ? "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" 
                                : `url(${nodeConfig.background.url})`,
                              backgroundColor: nodeConfig.background.source === "system" ? "#f5f7fa" : undefined 
                            }}
                          />

                          {/* UI组件 */}
                          {nodeConfig.uiComponents.elements.map((element) => {
                            if (element.type === "button") {
                              return (
                                <div
                                  key={element.id}
                                  className="absolute"
                                  style={{
                                    left: `${element.position.x}px`,
                                    top: `${element.position.y}px`,
                                  }}
                                >
                                  <button
                                    className="px-4 py-2 rounded"
                                    style={{ backgroundColor: element.properties.color || "#1890ff" }}
                                  >
                                    {element.properties.text || "按钮"}
                                  </button>
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      </div>
                    </div>

                    {/* 节点配置详情 - 新版选项卡 */}
                    {showPreview && (
                      <div className="w-80 overflow-auto border-l bg-gray-50 relative">
                        {/* 右侧选项卡 */}
                        <div className="absolute right-0 top-16 z-20">
                          <div className="flex flex-col">
                            <TabItem 
                              icon={<InfoIcon size={18} />} 
                              label="基本信息" 
                              isActive={activeConfigTab === "basic" && activeTab === "node"} 
                              onClick={() => {
                                setActiveConfigTab("basic");
                                setActiveTab("node");
                              }} 
                            />
                            <TabItem 
                              icon={<ImageIcon size={18} />} 
                              label="背景设置" 
                              isActive={activeConfigTab === "background" && activeTab === "node"} 
                              onClick={() => {
                                setActiveConfigTab("background");
                                setActiveTab("node");
                              }} 
                            />
                            <TabItem 
                              icon={<LayoutIcon size={18} />} 
                              label="UI组件" 
                              isActive={activeConfigTab === "ui" && activeTab === "node"} 
                              onClick={() => {
                                setActiveConfigTab("ui");
                                setActiveTab("node");
                              }} 
                            />
                            <TabItem 
                              icon={<Settings2 size={18} />} 
                              label="全局配置" 
                              isActive={activeTab === "global"} 
                              onClick={() => {
                                setActiveTab("global");
                              }} 
                            />
                          </div>
                        </div>

                        <div className="p-3 border-b bg-gray-50 sticky top-0 z-10">
                          <h3 className="text-sm font-medium flex items-center gap-2">
                            {activeTab === "node" && (
                              <>
                                {activeConfigTab === "basic" && <><InfoIcon className="h-4 w-4" />基本信息</>}
                                {activeConfigTab === "background" && <><ImageIcon className="h-4 w-4" />背景设置</>}
                                {activeConfigTab === "ui" && <><LayoutIcon className="h-4 w-4" />UI组件</>}
                              </>
                            )}
                            {activeTab === "global" && <><Settings2 className="h-4 w-4" />全局配置</>}
                          </h3>
                        </div>
                        <div className="p-4 pr-16">
                          {activeTab === "node" && (
                            <>
                              {activeConfigTab === "basic" && (
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="name">节点名称</Label>
                                    <Input
                                      id="name"
                                      value={nodeConfig.name || ""}
                                      onChange={(e) => {
                                        const updatedConfig = {
                                          ...nodeConfig,
                                          name: e.target.value,
                                        };
                                        setNodeConfig(updatedConfig);
                                      }}
                                      disabled={saving}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="description">节点描述</Label>
                                    <Input
                                      id="description"
                                      value={nodeConfig.description || ""}
                                      onChange={(e) => {
                                        const updatedConfig = {
                                          ...nodeConfig,
                                          description: e.target.value,
                                        };
                                        setNodeConfig(updatedConfig);
                                      }}
                                      disabled={saving}
                                    />
                                  </div>
                                  <Button 
                                    onClick={() => handleSaveNodeConfig(nodeConfig)}
                                    disabled={saving}
                                    className="bg-gray-800 hover:bg-gray-700"
                                  >
                                    {saving ? "保存中..." : "保存基本信息"}
                                  </Button>
                                </div>
                              )}

                              {activeConfigTab === "background" && (
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label>背景来源</Label>
                                    <Select
                                      value={nodeConfig.background.source}
                                      onValueChange={(value) => {
                                        const updatedConfig = {
                                          ...nodeConfig,
                                          background: {
                                            ...nodeConfig.background,
                                            source: value as "system" | "custom",
                                          },
                                        };
                                        setNodeConfig(updatedConfig);
                                      }}
                                      disabled={saving}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="选择背景来源" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="system">系统默认</SelectItem>
                                        <SelectItem value="custom">自定义上传</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  {nodeConfig.background.source === "custom" && (
                                    <div className="space-y-2">
                                      <Label>背景图片</Label>
                                      <BackgroundUploader
                                        initialUrl={nodeConfig.background.url}
                                        onUploadSuccess={(url, type) => {
                                          const updatedConfig = {
                                            ...nodeConfig,
                                            background: {
                                              ...nodeConfig.background,
                                              url,
                                              type,
                                            },
                                          };
                                          setNodeConfig(updatedConfig);
                                        }}
                                        disabled={saving}
                                      />
                                    </div>
                                  )}

                                  <Button 
                                    onClick={() => handleSaveNodeConfig(nodeConfig)}
                                    disabled={saving}
                                    className="bg-gray-800 hover:bg-gray-700"
                                  >
                                    {saving ? "保存中..." : "保存背景设置"}
                                  </Button>
                                </div>
                              )}

                              {activeConfigTab === "ui" && (
                                <div className="space-y-4">
                                  <div className="flex justify-between items-center">
                                    <Label>UI组件列表</Label>
                                    <Button
                                      type="button"
                                      size="sm"
                                      className="bg-gray-800 hover:bg-gray-700"
                                      onClick={() => {
                                        const newElement: UIElement = {
                                          id: Date.now().toString(),
                                          type: "button",
                                          position: { x: 100, y: 100 },
                                          properties: {
                                            text: "新按钮",
                                            color: "#333333"
                                          }
                                        };
                                        
                                        const updatedConfig = {
                                          ...nodeConfig,
                                          uiComponents: {
                                            ...nodeConfig.uiComponents,
                                            elements: [
                                              ...nodeConfig.uiComponents.elements,
                                              newElement
                                            ]
                                          }
                                        };
                                        
                                        setNodeConfig(updatedConfig);
                                      }}
                                      disabled={saving}
                                    >
                                      <PlusCircle className="h-4 w-4 mr-1" />
                                      添加组件
                                    </Button>
                                  </div>

                                  <div className="space-y-3">
                                    {nodeConfig.uiComponents.elements.length === 0 ? (
                                      <div className="text-center py-4 text-gray-500">
                                        点击"添加组件"按钮添加第一个UI组件
                                      </div>
                                    ) : (
                                      nodeConfig.uiComponents.elements.map((element, index) => (
                                        <div
                                          key={element.id}
                                          className="p-3 border rounded-md hover:border-gray-400"
                                        >
                                          <div className="flex justify-between items-center mb-2">
                                            <div className="font-medium">
                                              {element.type === "button"
                                                ? "按钮"
                                                : element.type === "text_field"
                                                ? "文本框"
                                                : "媒体播放器"}
                                            </div>
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="icon"
                                              onClick={() => {
                                                const updatedElements = nodeConfig.uiComponents.elements.filter(
                                                  (_, i) => i !== index
                                                );
                                                
                                                const updatedConfig = {
                                                  ...nodeConfig,
                                                  uiComponents: {
                                                    ...nodeConfig.uiComponents,
                                                    elements: updatedElements
                                                  }
                                                };
                                                
                                                setNodeConfig(updatedConfig);
                                              }}
                                              disabled={saving}
                                            >
                                              <Trash className="h-4 w-4 text-red-500" />
                                            </Button>
                                          </div>
                                          
                                          <div className="space-y-2 mt-2">
                                            <Label>位置</Label>
                                            <div className="grid grid-cols-2 gap-2">
                                              <div className="space-y-1">
                                                <Label className="text-xs">X坐标</Label>
                                                <Input
                                                  type="number"
                                                  value={element.position.x}
                                                  onChange={(e) => {
                                                    const updatedElements = [...nodeConfig.uiComponents.elements];
                                                    updatedElements[index] = {
                                                      ...element,
                                                      position: {
                                                        ...element.position,
                                                        x: parseInt(e.target.value) || 0
                                                      }
                                                    };
                                                    
                                                    const updatedConfig = {
                                                      ...nodeConfig,
                                                      uiComponents: {
                                                        ...nodeConfig.uiComponents,
                                                        elements: updatedElements
                                                      }
                                                    };
                                                    
                                                    setNodeConfig(updatedConfig);
                                                  }}
                                                  disabled={saving}
                                                />
                                              </div>
                                              <div className="space-y-1">
                                                <Label className="text-xs">Y坐标</Label>
                                                <Input
                                                  type="number"
                                                  value={element.position.y}
                                                  onChange={(e) => {
                                                    const updatedElements = [...nodeConfig.uiComponents.elements];
                                                    updatedElements[index] = {
                                                      ...element,
                                                      position: {
                                                        ...element.position,
                                                        y: parseInt(e.target.value) || 0
                                                      }
                                                    };
                                                    
                                                    const updatedConfig = {
                                                      ...nodeConfig,
                                                      uiComponents: {
                                                        ...nodeConfig.uiComponents,
                                                        elements: updatedElements
                                                      }
                                                    };
                                                    
                                                    setNodeConfig(updatedConfig);
                                                  }}
                                                  disabled={saving}
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>

                                  <Button 
                                    onClick={() => handleSaveNodeConfig(nodeConfig)}
                                    disabled={saving}
                                    className="bg-gray-800 hover:bg-gray-700"
                                  >
                                    {saving ? "保存中..." : "保存UI组件"}
                                  </Button>
                                </div>
                              )}
                            </>
                          )}

                          {activeTab === "global" && globalConfig && (
                            <div className="space-y-4">
                              <GlobalConfigForm
                                initialData={globalConfig}
                                onSubmit={handleSaveGlobalConfig}
                                disabled={saving}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* 高级功能区域 */}
        {showAdvanced && nodeConfig && globalConfig && (
          <div className="p-4 border-t bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ConfigImportExport
                nodeConfig={nodeConfig}
                globalConfig={globalConfig}
                onImportNodeConfig={handleImportNodeConfig}
                onImportGlobalConfig={handleImportGlobalConfig}
              />
              
              <ConfigVersionControl
                nodeConfig={nodeConfig}
                globalConfig={globalConfig}
                onRestore={handleRestoreVersion}
                onSaveVersion={handleSaveVersion}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 