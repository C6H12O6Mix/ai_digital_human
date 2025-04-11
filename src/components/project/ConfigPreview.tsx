"use client";

import { useState } from "react";
import { NodeConfig, GlobalConfig } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

interface ConfigPreviewProps {
  nodeConfig: NodeConfig;
  globalConfig: GlobalConfig;
}

export function ConfigPreview({ nodeConfig, globalConfig }: ConfigPreviewProps) {
  const [activeTab, setActiveTab] = useState("node");
  const [showPreview, setShowPreview] = useState(false);

  // 渲染节点配置预览
  const renderNodePreview = () => {
    return (
      <div className="relative w-full h-[500px] border rounded-lg overflow-hidden">
        {/* 背景 */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: nodeConfig.background.source === "system" 
              ? "url('/images/default-background.jpg')" 
              : `url(${nodeConfig.background.url})` 
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
          
          if (element.type === "text_field") {
            return (
              <div
                key={element.id}
                className="absolute"
                style={{
                  left: `${element.position.x}px`,
                  top: `${element.position.y}px`,
                }}
              >
                <input
                  type="text"
                  className="px-3 py-2 border rounded"
                  placeholder={element.properties.placeholder || "输入文本"}
                />
              </div>
            );
          }
          
          if (element.type === "media_player") {
            return (
              <div
                key={element.id}
                className="absolute"
                style={{
                  left: `${element.position.x}px`,
                  top: `${element.position.y}px`,
                }}
              >
                <div className="w-64 h-36 bg-black rounded flex items-center justify-center">
                  <span className="text-white">媒体播放器</span>
                </div>
              </div>
            );
          }
          
          return null;
        })}
      </div>
    );
  };

  // 渲染全局配置预览
  const renderGlobalPreview = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 数字人配置预览 */}
          <Card>
            <CardHeader>
              <CardTitle>数字人配置</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">视频源更新策略</h4>
                  <p className="text-sm text-gray-500">
                    {globalConfig.digitalHuman.modelConfig.videoSources.updateStrategy === "version_control" 
                      ? "版本控制" 
                      : "实时更新"}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">TTS配置</h4>
                  <p className="text-sm text-gray-500">
                    API: {globalConfig.digitalHuman.modelConfig.tts.voiceLib.api}
                  </p>
                  <p className="text-sm text-gray-500">
                    语速范围: {globalConfig.digitalHuman.modelConfig.tts.voiceLib.rate.min} - {globalConfig.digitalHuman.modelConfig.tts.voiceLib.rate.max}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* 交互配置预览 */}
          <Card>
            <CardHeader>
              <CardTitle>交互配置</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">默认交互模式</h4>
                  <p className="text-sm text-gray-500">
                    {globalConfig.interaction.defaultMode === "voice" ? "语音" : "文本"}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">语音控制类型</h4>
                  <p className="text-sm text-gray-500">
                    {globalConfig.interaction.voiceControl.type === "hold_to_talk" ? "按住说话" : "持续对话"}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">唤醒方式</h4>
                  <p className="text-sm text-gray-500">
                    {globalConfig.interaction.wakeup.methods.join(", ")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* 休眠模式预览 */}
        <Card>
          <CardHeader>
            <CardTitle>休眠模式</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">激活条件</h4>
                <p className="text-sm text-gray-500">
                  超时时间: {globalConfig.sleepMode.activation.timeout / 1000}秒
                </p>
                <p className="text-sm text-gray-500">
                  触发短语: {globalConfig.sleepMode.activation.phrases.join(", ")}
                </p>
              </div>
              <div>
                <h4 className="font-medium">唤醒条件</h4>
                <p className="text-sm text-gray-500">
                  唤醒短语: {globalConfig.sleepMode.wakeup.phrases.join(", ")}
                </p>
                <p className="text-sm text-gray-500">
                  重试次数: {globalConfig.sleepMode.wakeup.retryLimit}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">配置预览</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? (
            <>
              <EyeOff className="mr-2 h-4 w-4" />
              隐藏预览
            </>
          ) : (
            <>
              <Eye className="mr-2 h-4 w-4" />
              显示预览
            </>
          )}
        </Button>
      </div>
      
      {showPreview && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="node">节点预览</TabsTrigger>
            <TabsTrigger value="global">全局预览</TabsTrigger>
          </TabsList>
          
          <TabsContent value="node">
            <Card>
              <CardHeader>
                <CardTitle>节点配置预览</CardTitle>
                <CardDescription>预览节点背景和UI组件的效果</CardDescription>
              </CardHeader>
              <CardContent>
                {renderNodePreview()}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="global">
            <Card>
              <CardHeader>
                <CardTitle>全局配置预览</CardTitle>
                <CardDescription>预览全局配置的效果</CardDescription>
              </CardHeader>
              <CardContent>
                {renderGlobalPreview()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
} 