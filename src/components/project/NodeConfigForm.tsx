"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { NodeConfig, UIElement } from "@/types";
import { PlusCircle, Trash, Move } from "lucide-react";
import { toast } from "sonner";
import { BackgroundUploader } from "./BackgroundUploader";

// 组件属性定义
export interface NodeConfigFormProps {
  projectId: string;
  config: NodeConfig;
  onSave: (data: NodeConfig) => void;
  onImport: (data: NodeConfig) => void;
  saving?: boolean;
  hidePreview?: boolean;
}

export function NodeConfigForm({
  projectId,
  config,
  onSave,
  onImport,
  saving = false,
  hidePreview = false,
}: NodeConfigFormProps) {
  const [formData, setFormData] = useState<NodeConfig>(config);
  const [selectedElementIndex, setSelectedElementIndex] = useState<number | null>(null);
  const [previewMode, setPreviewMode] = useState(true);
  const [draggedElement, setDraggedElement] = useState<{
    index: number;
    startX: number;
    startY: number;
    elementX: number;
    elementY: number;
  } | null>(null);
  const [showBackgroundUploader, setShowBackgroundUploader] = useState(false);
  
  const canvasWidth = 800;
  const canvasHeight = 600;
  const gridSize = 20;

  const handleBackgroundUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      background: {
        ...prev.background,
        url: e.target.value,
      },
    }));
  };
  
  const handleBackgroundUploadSuccess = (url: string, type: "image" | "video") => {
    setFormData((prev) => ({
      ...prev,
      background: {
        ...prev.background,
        url,
        type,
      },
    }));
    setShowBackgroundUploader(false);
  };

  const handleAddElement = () => {
    const newElement = {
      id: Date.now().toString(),
      type: "button" as const,
      position: { x: 100, y: 100 },
      properties: {
        text: "新按钮",
        color: "#1890ff",
      },
    };

    setFormData((prev) => ({
      ...prev,
      uiComponents: {
        ...prev.uiComponents,
        elements: [...prev.uiComponents.elements, newElement],
      },
    }));

    setSelectedElementIndex(formData.uiComponents.elements.length);
  };

  const handleDeleteElement = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      uiComponents: {
        ...prev.uiComponents,
        elements: prev.uiComponents.elements.filter((_, i) => i !== index),
      },
    }));

    setSelectedElementIndex(null);
  };

  const handleElementTypeChange = (index: number, value: string) => {
    const elements = [...formData.uiComponents.elements];
    
    let properties = {};
    switch (value) {
      case "button":
        properties = { text: "按钮", color: "#1890ff" };
        break;
      case "text_field":
        properties = { placeholder: "请输入...", color: "#000000" };
        break;
      case "media_player":
        properties = { src: "", color: "#ffffff" };
        break;
    }
    
    elements[index] = {
      ...elements[index],
      type: value as "button" | "text_field" | "media_player",
      properties,
    };
    
    setFormData((prev) => ({
      ...prev,
      uiComponents: {
        ...prev.uiComponents,
        elements,
      },
    }));
  };

  const handlePropertyChange = (index: number, property: string, value: string) => {
    const elements = [...formData.uiComponents.elements];
    elements[index] = {
      ...elements[index],
      properties: {
        ...elements[index].properties,
        [property]: value,
      },
    };
    
    setFormData((prev) => ({
      ...prev,
      uiComponents: {
        ...prev.uiComponents,
        elements,
      },
    }));
  };

  const handleGridSnapChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      uiComponents: {
        ...prev.uiComponents,
        dragConfig: {
          ...(prev.uiComponents.dragConfig || { gridSnap: true, boundaryCheck: true }),
          gridSnap: checked,
        },
      },
    }));
  };

  const handleBoundaryCheckChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      uiComponents: {
        ...prev.uiComponents,
        dragConfig: {
          ...(prev.uiComponents.dragConfig || { gridSnap: true, boundaryCheck: true }),
          boundaryCheck: checked,
        },
      },
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    
    try {
      onSave(formData);
    } catch (error) {
      console.error("提交表单失败:", error);
      toast.error("提交表单失败");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">基本信息</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">节点名称</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }));
                }}
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">节点描述</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }));
                }}
                disabled={saving}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">背景设置</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="background-source">背景来源</Label>
              <Select
                value={formData.background.source}
                onValueChange={(value) => {
                  setFormData((prev) => ({
                    ...prev,
                    background: {
                      ...prev.background,
                      source: value as "system" | "custom",
                    },
                  }));
                  
                  if (value === "custom") {
                    setShowBackgroundUploader(true);
                  } else {
                    setShowBackgroundUploader(false);
                  }
                }}
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择背景来源" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">系统</SelectItem>
                  <SelectItem value="custom">自定义</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.background.source === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="background-type">背景类型</Label>
                <Select
                  value={formData.background.type || "image"}
                  onValueChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      background: {
                        ...prev.background,
                        type: value as "image" | "video",
                      },
                    }));
                  }}
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择背景类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">图片背景</SelectItem>
                    <SelectItem value="video">视频背景</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          {formData.background.source === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="background-url">背景URL</Label>
              <Input
                id="background-url"
                value={formData.background.url || ""}
                onChange={handleBackgroundUrlChange}
                disabled={saving || showBackgroundUploader}
                placeholder={`输入${formData.background.type === "image" ? "图片" : "视频"}URL`}
              />
            </div>
          )}
          
          {showBackgroundUploader && (
            <div className="mt-4">
              <BackgroundUploader 
                onUploadSuccess={handleBackgroundUploadSuccess}
                disabled={saving} 
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          {!hidePreview && (
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <Switch
                  checked={previewMode}
                  onCheckedChange={setPreviewMode}
                  disabled={saving}
                />
                <span className="ml-2 text-sm text-gray-600">
                  {previewMode ? "预览模式开启" : "预览模式关闭"}
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <Switch
                    checked={formData.uiComponents.dragConfig?.gridSnap ?? true}
                    onCheckedChange={handleGridSnapChange}
                    disabled={saving || !previewMode}
                  />
                  <span className="ml-2 text-sm text-gray-600">网格对齐</span>
                </div>
                
                <div className="flex items-center">
                  <Switch
                    checked={formData.uiComponents.dragConfig?.boundaryCheck ?? true}
                    onCheckedChange={handleBoundaryCheckChange}
                    disabled={saving || !previewMode}
                  />
                  <span className="ml-2 text-sm text-gray-600">边界检查</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">UI组件</h3>
            <Button
              type="button"
              onClick={handleAddElement}
              disabled={saving}
              size="sm"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              添加组件
            </Button>
          </div>
          
          <div className={hidePreview ? "space-y-6" : "flex space-x-4"}>
            <div className={hidePreview ? "space-y-4 w-full grid grid-cols-2 gap-4" : "w-1/2 space-y-4"}>
              {formData.uiComponents.elements.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  点击"添加组件"按钮添加第一个UI组件
                </div>
              ) : (
                formData.uiComponents.elements.map((element, index) => (
                  <div
                    key={element.id}
                    className={`p-3 border rounded-md ${
                      selectedElementIndex === index ? "border-blue-500 bg-blue-50" : ""
                    }`}
                    onClick={() => setSelectedElementIndex(index)}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteElement(index);
                        }}
                        disabled={saving}
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    
                    {selectedElementIndex === index && (
                      <div className="space-y-3 mt-3 pt-3 border-t">
                        <div className="space-y-1">
                          <Label htmlFor={`element-type-${index}`}>组件类型</Label>
                          <Select
                            value={element.type}
                            onValueChange={(value) => handleElementTypeChange(index, value)}
                            disabled={saving}
                          >
                            <SelectTrigger id={`element-type-${index}`}>
                              <SelectValue placeholder="选择组件类型" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="button">按钮</SelectItem>
                              <SelectItem value="text_field">文本框</SelectItem>
                              <SelectItem value="media_player">媒体播放器</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label htmlFor={`element-x-${index}`}>X坐标</Label>
                            <Input
                              id={`element-x-${index}`}
                              type="number"
                              value={element.position.x}
                              onChange={(e) => {
                                const elements = [...formData.uiComponents.elements];
                                elements[index] = {
                                  ...elements[index],
                                  position: {
                                    ...elements[index].position,
                                    x: parseInt(e.target.value) || 0,
                                  },
                                };
                                
                                setFormData((prev) => ({
                                  ...prev,
                                  uiComponents: {
                                    ...prev.uiComponents,
                                    elements,
                                  },
                                }));
                              }}
                              min={0}
                              max={canvasWidth}
                              disabled={saving}
                            />
                          </div>
                          
                          <div className="space-y-1">
                            <Label htmlFor={`element-y-${index}`}>Y坐标</Label>
                            <Input
                              id={`element-y-${index}`}
                              type="number"
                              value={element.position.y}
                              onChange={(e) => {
                                const elements = [...formData.uiComponents.elements];
                                elements[index] = {
                                  ...elements[index],
                                  position: {
                                    ...elements[index].position,
                                    y: parseInt(e.target.value) || 0,
                                  },
                                };
                                
                                setFormData((prev) => ({
                                  ...prev,
                                  uiComponents: {
                                    ...prev.uiComponents,
                                    elements,
                                  },
                                }));
                              }}
                              min={0}
                              max={canvasHeight}
                              disabled={saving}
                            />
                          </div>
                        </div>
                        
                        {element.type === "button" && (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <Label htmlFor={`button-text-${index}`}>按钮文本</Label>
                              <Input
                                id={`button-text-${index}`}
                                value={element.properties.text || ""}
                                onChange={(e) => handlePropertyChange(index, "text", e.target.value)}
                                disabled={saving}
                              />
                            </div>
                            
                            <div className="space-y-1">
                              <Label htmlFor={`button-color-${index}`}>按钮颜色</Label>
                              <div className="flex">
                                <Input
                                  id={`button-color-${index}`}
                                  type="color"
                                  value={element.properties.color || "#1890ff"}
                                  onChange={(e) => handlePropertyChange(index, "color", e.target.value)}
                                  disabled={saving}
                                  className="w-12 p-1 h-10"
                                />
                                <Input
                                  type="text"
                                  value={element.properties.color || "#1890ff"}
                                  onChange={(e) => handlePropertyChange(index, "color", e.target.value)}
                                  disabled={saving}
                                  className="flex-1 ml-2"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {element.type === "text_field" && (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <Label htmlFor={`textfield-placeholder-${index}`}>占位文本</Label>
                              <Input
                                id={`textfield-placeholder-${index}`}
                                value={element.properties.placeholder || ""}
                                onChange={(e) => handlePropertyChange(index, "placeholder", e.target.value)}
                                disabled={saving}
                              />
                            </div>
                            
                            <div className="space-y-1">
                              <Label htmlFor={`textfield-color-${index}`}>文本颜色</Label>
                              <div className="flex">
                                <Input
                                  id={`textfield-color-${index}`}
                                  type="color"
                                  value={element.properties.color || "#000000"}
                                  onChange={(e) => handlePropertyChange(index, "color", e.target.value)}
                                  disabled={saving}
                                  className="w-12 p-1 h-10"
                                />
                                <Input
                                  type="text"
                                  value={element.properties.color || "#000000"}
                                  onChange={(e) => handlePropertyChange(index, "color", e.target.value)}
                                  disabled={saving}
                                  className="flex-1 ml-2"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {element.type === "media_player" && (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <Label htmlFor={`mediaplayer-src-${index}`}>媒体源URL</Label>
                              <Input
                                id={`mediaplayer-src-${index}`}
                                value={element.properties.src || ""}
                                onChange={(e) => handlePropertyChange(index, "src", e.target.value)}
                                disabled={saving}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Button type="submit" disabled={saving} className="w-full">
        {saving ? "保存中..." : "保存配置"}
      </Button>
    </form>
  );
} 