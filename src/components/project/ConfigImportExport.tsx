"use client";

import { useState } from "react";
import { NodeConfig, GlobalConfig } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Upload, FileDown, FileCog } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

// 配置验证 Schema
const positionSchema = z.object({
  x: z.number().min(0).max(1000),
  y: z.number().min(0).max(1000),
});

const uiElementSchema = z.object({
  id: z.string(),
  type: z.enum(["button", "text_field", "media_player"]),
  position: positionSchema,
  properties: z.record(z.any()),
});

const dragConfigSchema = z.object({
  gridSnap: z.boolean(),
  boundaryCheck: z.boolean(),
}).optional();

const nodeConfigSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  background: z.object({
    source: z.enum(["system", "custom"]),
    url: z.string().optional(),
  }),
  uiComponents: z.object({
    elements: z.array(uiElementSchema),
    dragConfig: dragConfigSchema,
  }),
  createdAt: z.any(), // 允许日期字符串, 导入时会转换
  updatedAt: z.any(),
});

const emotionMappingSchema = z.object({
  happy: z.number(),
  sad: z.number(),
  neutral: z.number().optional(),
  angry: z.number().optional(),
});

const globalConfigSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  digitalHuman: z.object({
    modelConfig: z.object({
      videoSources: z.object({
        updateStrategy: z.literal("version_control"),
      }),
      tts: z.object({
        voiceLib: z.object({
          api: z.string().url(),
          rate: z.object({
            min: z.number().min(0.1).max(1),
            max: z.number().min(1).max(5),
          }),
        }),
        emotionMapping: emotionMappingSchema,
      }),
    }),
  }),
  interaction: z.object({
    defaultMode: z.enum(["voice", "text"]),
    voiceControl: z.object({
      type: z.enum(["hold_to_talk", "continuous"]),
    }),
    wakeup: z.object({
      methods: z.array(z.string()),
      sensitivity: z.object({
        level: z.number().min(1).max(10),
        threshold: z.number().min(0).max(1),
      }),
    }),
    interrupt: z.object({
      phrases: z.array(z.string()),
      clearDelay: z.object({
        min: z.number().min(0),
        max: z.number().min(0),
        default: z.number().min(0),
      }),
    }),
  }),
  sleepMode: z.object({
    activation: z.object({
      timeout: z.number().min(0),
      phrases: z.array(z.string()),
    }),
    wakeup: z.object({
      phrases: z.array(z.string()),
      retryLimit: z.number().min(0),
    }),
  }),
  createdAt: z.any(),
  updatedAt: z.any(),
});

const importConfigSchema = z.object({
  nodeConfig: nodeConfigSchema.optional(),
  globalConfig: globalConfigSchema.optional(),
}).refine(data => data.nodeConfig || data.globalConfig, {
  message: "文件必须包含节点配置或全局配置"
});

interface ConfigImportExportProps {
  nodeConfig: NodeConfig;
  globalConfig: GlobalConfig;
  onImportNodeConfig: (config: NodeConfig) => void;
  onImportGlobalConfig: (config: GlobalConfig) => void;
}

export function ConfigImportExport({
  nodeConfig,
  globalConfig,
  onImportNodeConfig,
  onImportGlobalConfig,
}: ConfigImportExportProps) {
  const [importing, setImporting] = useState(false);
  
  // 处理导出节点配置
  const handleExportNodeConfig = () => {
    try {
      const configString = JSON.stringify(nodeConfig, null, 2);
      const blob = new Blob([configString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = `node-config-${nodeConfig.projectId}-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
      
      toast.success("节点配置导出成功");
    } catch (error) {
      console.error("导出节点配置失败:", error);
      toast.error("导出节点配置失败");
    }
  };
  
  // 处理导出全局配置
  const handleExportGlobalConfig = () => {
    try {
      const configString = JSON.stringify(globalConfig, null, 2);
      const blob = new Blob([configString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = `global-config-${globalConfig.projectId}-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
      
      toast.success("全局配置导出成功");
    } catch (error) {
      console.error("导出全局配置失败:", error);
      toast.error("导出全局配置失败");
    }
  };
  
  // 处理导出所有配置
  const handleExportAllConfig = () => {
    try {
      const configString = JSON.stringify({
        nodeConfig,
        globalConfig,
      }, null, 2);
      const blob = new Blob([configString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = `all-config-${nodeConfig.projectId}-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
      
      toast.success("所有配置导出成功");
    } catch (error) {
      console.error("导出所有配置失败:", error);
      toast.error("导出所有配置失败");
    }
  };
  
  // 处理导入配置
  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // 检查文件类型
    if (file.type !== "application/json") {
      toast.error("文件类型错误，请上传JSON文件");
      event.target.value = "";
      return;
    }
    
    // 检查文件大小 (限制为2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      toast.error("文件过大，请上传小于2MB的文件");
      event.target.value = "";
      return;
    }
    
    setImporting(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content);
        
        // 验证导入的配置格式
        try {
          const validatedData = importConfigSchema.parse(parsedData);
          
          // 导入节点配置
          if (validatedData.nodeConfig) {
            // 转换日期字符串为Date对象
            const nodeConfig = {
              ...validatedData.nodeConfig,
              createdAt: new Date(validatedData.nodeConfig.createdAt),
              updatedAt: new Date(),
            };
            onImportNodeConfig(nodeConfig as NodeConfig);
          }
          
          // 导入全局配置
          if (validatedData.globalConfig) {
            // 转换日期字符串为Date对象
            const globalConfig = {
              ...validatedData.globalConfig,
              createdAt: new Date(validatedData.globalConfig.createdAt),
              updatedAt: new Date(),
            };
            onImportGlobalConfig(globalConfig as GlobalConfig);
          }
          
          toast.success("配置导入成功");
        } catch (validationError) {
          console.error("配置验证失败:", validationError);
          
          if (validationError instanceof z.ZodError) {
            const firstError = validationError.errors[0];
            toast.error(`配置验证失败: ${firstError.path.join('.')} - ${firstError.message}`);
          } else {
            toast.error("配置格式无效，请检查文件内容");
          }
        }
      } catch (parseError) {
        console.error("解析JSON失败:", parseError);
        toast.error("无法解析配置文件，请确保文件内容是有效的JSON");
      } finally {
        setImporting(false);
        event.target.value = "";
      }
    };
    
    reader.onerror = () => {
      toast.error("读取文件失败");
      setImporting(false);
      event.target.value = "";
    };
    
    reader.readAsText(file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCog className="h-5 w-5" />
          配置导入/导出
        </CardTitle>
        <CardDescription>导出或导入项目配置</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-4">
            <h3 className="font-medium">导出配置</h3>
            <div className="flex flex-col gap-2">
              <Button onClick={handleExportNodeConfig} variant="outline" className="justify-start">
                <Download className="mr-2 h-4 w-4" />
                导出节点配置
              </Button>
              <Button onClick={handleExportGlobalConfig} variant="outline" className="justify-start">
                <Download className="mr-2 h-4 w-4" />
                导出全局配置
              </Button>
              <Button onClick={handleExportAllConfig} variant="outline" className="justify-start">
                <FileDown className="mr-2 h-4 w-4" />
                导出所有配置
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium">导入配置</h3>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-gray-500">
                选择JSON格式的配置文件进行导入。文件可以包含节点配置、全局配置或两者都包含。
              </p>
              <div>
                <label
                  htmlFor="config-file"
                  className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background hover:bg-accent hover:text-accent-foreground"
                >
                  <Upload className="h-4 w-4" />
                  {importing ? "导入中..." : "选择配置文件"}
                  <input
                    id="config-file"
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImportConfig}
                    disabled={importing}
                  />
                </label>
                <p className="mt-2 text-xs text-gray-500">
                  支持的文件类型: .json (最大2MB)
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 