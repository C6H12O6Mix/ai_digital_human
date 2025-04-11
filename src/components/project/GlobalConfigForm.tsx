"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { GlobalConfig } from "@/types";
import { Plus, Minus } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";

// 表单验证schema
const emotionMappingSchema = z.object({
  happy: z.number(),
  sad: z.number(),
  neutral: z.number().optional(),
  angry: z.number().optional(),
});

const globalConfigSchema = z.object({
  id: z.string().optional(),
  projectId: z.string(),
  digitalHuman: z.object({
    modelConfig: z.object({
      videoSources: z.object({
        updateStrategy: z.enum(["version_control"]),
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
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export interface GlobalConfigFormProps {
  initialData: GlobalConfig;
  onSubmit: (data: GlobalConfig) => void;
  disabled?: boolean;
}

export function GlobalConfigForm({ initialData, onSubmit, disabled = false }: GlobalConfigFormProps) {
  const [formData, setFormData] = useState<GlobalConfig>({
    ...initialData,
    digitalHuman: {
      ...initialData.digitalHuman,
      modelConfig: {
        ...initialData.digitalHuman.modelConfig,
        tts: {
          ...initialData.digitalHuman.modelConfig.tts,
          emotionMapping: {
            ...initialData.digitalHuman.modelConfig.tts.emotionMapping,
            neutral: initialData.digitalHuman.modelConfig.tts.emotionMapping.neutral || 0,
            angry: initialData.digitalHuman.modelConfig.tts.emotionMapping.angry || -1,
          },
        },
      },
    },
  });
  
  // 处理视频源更新策略变更
  const handleVideoSourceStrategyChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      digitalHuman: {
        ...prev.digitalHuman,
        modelConfig: {
          ...prev.digitalHuman.modelConfig,
          videoSources: {
            ...prev.digitalHuman.modelConfig.videoSources,
            updateStrategy: value as "version_control",
          },
        },
      },
    }));
  };
  
  // 处理TTS API变更
  const handleTtsApiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      digitalHuman: {
        ...prev.digitalHuman,
        modelConfig: {
          ...prev.digitalHuman.modelConfig,
          tts: {
            ...prev.digitalHuman.modelConfig.tts,
            voiceLib: {
              ...prev.digitalHuman.modelConfig.tts.voiceLib,
              api: e.target.value,
            },
          },
        },
      },
    }));
  };
  
  // 处理TTS速率变更
  const handleTtsRateChange = (type: "min" | "max", value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    
    setFormData((prev) => ({
      ...prev,
      digitalHuman: {
        ...prev.digitalHuman,
        modelConfig: {
          ...prev.digitalHuman.modelConfig,
          tts: {
            ...prev.digitalHuman.modelConfig.tts,
            voiceLib: {
              ...prev.digitalHuman.modelConfig.tts.voiceLib,
              rate: {
                ...prev.digitalHuman.modelConfig.tts.voiceLib.rate,
                [type]: numValue,
              },
            },
          },
        },
      },
    }));
  };
  
  // 处理情感映射变更
  const handleEmotionMappingChange = (emotion: string, value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue)) return;
    
    setFormData((prev) => ({
      ...prev,
      digitalHuman: {
        ...prev.digitalHuman,
        modelConfig: {
          ...prev.digitalHuman.modelConfig,
          tts: {
            ...prev.digitalHuman.modelConfig.tts,
            emotionMapping: {
              ...prev.digitalHuman.modelConfig.tts.emotionMapping,
              [emotion]: numValue,
            },
          },
        },
      },
    }));
  };
  
  // 处理交互模式变更
  const handleInteractionModeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      interaction: {
        ...prev.interaction,
        defaultMode: value as "voice" | "text",
      },
    }));
  };
  
  // 处理语音控制类型变更
  const handleVoiceControlTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      interaction: {
        ...prev.interaction,
        voiceControl: {
          ...prev.interaction.voiceControl,
          type: value as "hold_to_talk" | "continuous",
        },
      },
    }));
  };
  
  // 处理唤醒方法变更
  const handleWakeupMethodsChange = (method: string, checked: boolean) => {
    const currentMethods = [...formData.interaction.wakeup.methods];
    
    if (checked && !currentMethods.includes(method)) {
      currentMethods.push(method);
    } else if (!checked && currentMethods.includes(method)) {
      const index = currentMethods.indexOf(method);
      currentMethods.splice(index, 1);
    }
    
    setFormData((prev) => ({
      ...prev,
      interaction: {
        ...prev.interaction,
        wakeup: {
          ...prev.interaction.wakeup,
          methods: currentMethods,
        },
      },
    }));
  };
  
  // 处理唤醒敏感度变更
  const handleWakeupSensitivityChange = (type: "level" | "threshold", value: string) => {
    const numValue = type === "level" ? parseInt(value) : parseFloat(value);
    if (isNaN(numValue)) return;
    
    setFormData((prev) => ({
      ...prev,
      interaction: {
        ...prev.interaction,
        wakeup: {
          ...prev.interaction.wakeup,
          sensitivity: {
            ...prev.interaction.wakeup.sensitivity,
            [type]: numValue,
          },
        },
      },
    }));
  };
  
  // 处理打断词组变更
  const handleInterruptPhrasesChange = (index: number, value: string) => {
    const phrases = [...formData.interaction.interrupt.phrases];
    phrases[index] = value;
    
    setFormData((prev) => ({
      ...prev,
      interaction: {
        ...prev.interaction,
        interrupt: {
          ...prev.interaction.interrupt,
          phrases,
        },
      },
    }));
  };
  
  // 添加打断词组
  const handleAddInterruptPhrase = () => {
    setFormData((prev) => ({
      ...prev,
      interaction: {
        ...prev.interaction,
        interrupt: {
          ...prev.interaction.interrupt,
          phrases: [...prev.interaction.interrupt.phrases, ""],
        },
      },
    }));
  };
  
  // 删除打断词组
  const handleRemoveInterruptPhrase = (index: number) => {
    const phrases = [...formData.interaction.interrupt.phrases];
    phrases.splice(index, 1);
    
    setFormData((prev) => ({
      ...prev,
      interaction: {
        ...prev.interaction,
        interrupt: {
          ...prev.interaction.interrupt,
          phrases,
        },
      },
    }));
  };
  
  // 处理清空延迟变更
  const handleClearDelayChange = (type: "min" | "max" | "default", value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue)) return;
    
    setFormData((prev) => ({
      ...prev,
      interaction: {
        ...prev.interaction,
        interrupt: {
          ...prev.interaction.interrupt,
          clearDelay: {
            ...prev.interaction.interrupt.clearDelay,
            [type]: numValue,
          },
        },
      },
    }));
  };
  
  // 处理休眠超时变更
  const handleSleepTimeoutChange = (value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue)) return;
    
    setFormData((prev) => ({
      ...prev,
      sleepMode: {
        ...prev.sleepMode,
        activation: {
          ...prev.sleepMode.activation,
          timeout: numValue,
        },
      },
    }));
  };
  
  // 处理休眠激活词组变更
  const handleSleepActivationPhrasesChange = (index: number, value: string) => {
    const phrases = [...formData.sleepMode.activation.phrases];
    phrases[index] = value;
    
    setFormData((prev) => ({
      ...prev,
      sleepMode: {
        ...prev.sleepMode,
        activation: {
          ...prev.sleepMode.activation,
          phrases,
        },
      },
    }));
  };
  
  // 添加休眠激活词组
  const handleAddSleepActivationPhrase = () => {
    setFormData((prev) => ({
      ...prev,
      sleepMode: {
        ...prev.sleepMode,
        activation: {
          ...prev.sleepMode.activation,
          phrases: [...prev.sleepMode.activation.phrases, ""],
        },
      },
    }));
  };
  
  // 删除休眠激活词组
  const handleRemoveSleepActivationPhrase = (index: number) => {
    const phrases = [...formData.sleepMode.activation.phrases];
    phrases.splice(index, 1);
    
    setFormData((prev) => ({
      ...prev,
      sleepMode: {
        ...prev.sleepMode,
        activation: {
          ...prev.sleepMode.activation,
          phrases,
        },
      },
    }));
  };
  
  // 处理唤醒词组变更
  const handleSleepWakeupPhrasesChange = (index: number, value: string) => {
    const phrases = [...formData.sleepMode.wakeup.phrases];
    phrases[index] = value;
    
    setFormData((prev) => ({
      ...prev,
      sleepMode: {
        ...prev.sleepMode,
        wakeup: {
          ...prev.sleepMode.wakeup,
          phrases,
        },
      },
    }));
  };
  
  // 添加唤醒词组
  const handleAddSleepWakeupPhrase = () => {
    setFormData((prev) => ({
      ...prev,
      sleepMode: {
        ...prev.sleepMode,
        wakeup: {
          ...prev.sleepMode.wakeup,
          phrases: [...prev.sleepMode.wakeup.phrases, ""],
        },
      },
    }));
  };
  
  // 删除唤醒词组
  const handleRemoveSleepWakeupPhrase = (index: number) => {
    const phrases = [...formData.sleepMode.wakeup.phrases];
    phrases.splice(index, 1);
    
    setFormData((prev) => ({
      ...prev,
      sleepMode: {
        ...prev.sleepMode,
        wakeup: {
          ...prev.sleepMode.wakeup,
          phrases,
        },
      },
    }));
  };
  
  // 处理重试限制变更
  const handleRetryLimitChange = (value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue)) return;
    
    setFormData((prev) => ({
      ...prev,
      sleepMode: {
        ...prev.sleepMode,
        wakeup: {
          ...prev.sleepMode.wakeup,
          retryLimit: numValue,
        },
      },
    }));
  };
  
  // 提交表单
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // 验证数据
      const validatedData = globalConfigSchema.parse(formData);
      onSubmit(validatedData as GlobalConfig);
    } catch (error) {
      console.error("表单验证失败:", error);
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast.error(`验证失败: ${firstError.path.join('.')} - ${firstError.message}`);
      } else {
        toast.error("表单验证失败，请检查输入");
      }
    }
  };

  // 渲染情感映射编辑器
  const renderEmotionMapping = () => {
    const emotions = [
      { key: "happy", label: "高兴", defaultValue: 1 },
      { key: "neutral", label: "中性", defaultValue: 0 },
      { key: "sad", label: "悲伤", defaultValue: -1 },
      { key: "angry", label: "愤怒", defaultValue: -2 },
    ];
    
    return (
      <div className="space-y-3">
        <Label>情感映射</Label>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {emotions.map((emotion) => (
                <div key={emotion.key} className="flex items-center space-x-4">
                  <Label htmlFor={`emotion-${emotion.key}`} className="w-16">{emotion.label}</Label>
                  <Input
                    id={`emotion-${emotion.key}`}
                    type="range"
                    min="-5"
                    max="5"
                    step="1"
                    value={formData.digitalHuman.modelConfig.tts.emotionMapping[emotion.key as keyof typeof formData.digitalHuman.modelConfig.tts.emotionMapping] || emotion.defaultValue}
                    onChange={(e) => handleEmotionMappingChange(emotion.key, e.target.value)}
                    disabled={disabled}
                    className="flex-1"
                  />
                  <span className="w-8 text-center">
                    {formData.digitalHuman.modelConfig.tts.emotionMapping[emotion.key as keyof typeof formData.digitalHuman.modelConfig.tts.emotionMapping] || emotion.defaultValue}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">数字人配置</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="video-update-strategy">视频源更新策略</Label>
            <Select
              value={formData.digitalHuman.modelConfig.videoSources.updateStrategy}
              onValueChange={handleVideoSourceStrategyChange}
              disabled={disabled}
            >
              <SelectTrigger id="video-update-strategy">
                <SelectValue placeholder="选择更新策略" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="version_control">版本控制</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tts-api">TTS API</Label>
            <Input
              id="tts-api"
              type="url"
              value={formData.digitalHuman.modelConfig.tts.voiceLib.api}
              onChange={handleTtsApiChange}
              placeholder="输入TTS API地址"
              disabled={disabled}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tts-rate-min">语速最小值</Label>
              <Input
                id="tts-rate-min"
                type="number"
                min="0.1"
                max="1"
                step="0.1"
                value={formData.digitalHuman.modelConfig.tts.voiceLib.rate.min}
                onChange={(e) => handleTtsRateChange("min", e.target.value)}
                disabled={disabled}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tts-rate-max">语速最大值</Label>
              <Input
                id="tts-rate-max"
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={formData.digitalHuman.modelConfig.tts.voiceLib.rate.max}
                onChange={(e) => handleTtsRateChange("max", e.target.value)}
                disabled={disabled}
              />
            </div>
          </div>
          
          {renderEmotionMapping()}
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">交互配置</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="default-mode">默认交互模式</Label>
            <Select
              value={formData.interaction.defaultMode}
              onValueChange={handleInteractionModeChange}
              disabled={disabled}
            >
              <SelectTrigger id="default-mode">
                <SelectValue placeholder="选择交互模式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="voice">语音</SelectItem>
                <SelectItem value="text">文本</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="voice-control-type">语音控制类型</Label>
            <Select
              value={formData.interaction.voiceControl.type}
              onValueChange={handleVoiceControlTypeChange}
              disabled={disabled || formData.interaction.defaultMode !== "voice"}
            >
              <SelectTrigger id="voice-control-type">
                <SelectValue placeholder="选择语音控制类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hold_to_talk">按住说话</SelectItem>
                <SelectItem value="continuous">连续对话</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>唤醒方式</Label>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="wakeup-voice"
                  checked={formData.interaction.wakeup.methods.includes("voice_keyword")}
                  onCheckedChange={(value: boolean) => handleWakeupMethodsChange("voice_keyword", value)}
                  disabled={disabled}
                />
                <Label htmlFor="wakeup-voice">语音关键词</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="wakeup-face"
                  checked={formData.interaction.wakeup.methods.includes("face_recognition")}
                  onCheckedChange={(value: boolean) => handleWakeupMethodsChange("face_recognition", value)}
                  disabled={disabled}
                />
                <Label htmlFor="wakeup-face">人脸识别</Label>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sensitivity-level">敏感度级别</Label>
              <Input
                id="sensitivity-level"
                type="number"
                min="1"
                max="10"
                value={formData.interaction.wakeup.sensitivity.level}
                onChange={(e) => handleWakeupSensitivityChange("level", e.target.value)}
                disabled={disabled}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sensitivity-threshold">敏感度阈值</Label>
              <Input
                id="sensitivity-threshold"
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={formData.interaction.wakeup.sensitivity.threshold}
                onChange={(e) => handleWakeupSensitivityChange("threshold", e.target.value)}
                disabled={disabled}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>打断词组</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddInterruptPhrase}
                disabled={disabled}
              >
                <Plus className="h-4 w-4 mr-1" />
                添加
              </Button>
            </div>
            
            <div className="space-y-2">
              {formData.interaction.interrupt.phrases.map((phrase, index) => (
                <div key={index} className="flex space-x-2">
                  <Input
                    value={phrase}
                    onChange={(e) => handleInterruptPhrasesChange(index, e.target.value)}
                    placeholder="输入打断词组"
                    disabled={disabled}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveInterruptPhrase(index)}
                    disabled={disabled || formData.interaction.interrupt.phrases.length <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clear-delay-min">清空延迟最小值 (ms)</Label>
              <Input
                id="clear-delay-min"
                type="number"
                min="0"
                value={formData.interaction.interrupt.clearDelay.min}
                onChange={(e) => handleClearDelayChange("min", e.target.value)}
                disabled={disabled}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clear-delay-max">清空延迟最大值 (ms)</Label>
              <Input
                id="clear-delay-max"
                type="number"
                min="0"
                value={formData.interaction.interrupt.clearDelay.max}
                onChange={(e) => handleClearDelayChange("max", e.target.value)}
                disabled={disabled}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clear-delay-default">清空延迟默认值 (ms)</Label>
              <Input
                id="clear-delay-default"
                type="number"
                min="0"
                value={formData.interaction.interrupt.clearDelay.default}
                onChange={(e) => handleClearDelayChange("default", e.target.value)}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">休眠模式</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sleep-timeout">休眠超时 (ms)</Label>
            <Input
              id="sleep-timeout"
              type="number"
              min="0"
              value={formData.sleepMode.activation.timeout}
              onChange={(e) => handleSleepTimeoutChange(e.target.value)}
              disabled={disabled}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>休眠激活词组</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSleepActivationPhrase}
                disabled={disabled}
              >
                <Plus className="h-4 w-4 mr-1" />
                添加
              </Button>
            </div>
            
            <div className="space-y-2">
              {formData.sleepMode.activation.phrases.map((phrase, index) => (
                <div key={index} className="flex space-x-2">
                  <Input
                    value={phrase}
                    onChange={(e) => handleSleepActivationPhrasesChange(index, e.target.value)}
                    placeholder="输入休眠激活词组"
                    disabled={disabled}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveSleepActivationPhrase(index)}
                    disabled={disabled || formData.sleepMode.activation.phrases.length <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>唤醒词组</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSleepWakeupPhrase}
                disabled={disabled}
              >
                <Plus className="h-4 w-4 mr-1" />
                添加
              </Button>
            </div>
            
            <div className="space-y-2">
              {formData.sleepMode.wakeup.phrases.map((phrase, index) => (
                <div key={index} className="flex space-x-2">
                  <Input
                    value={phrase}
                    onChange={(e) => handleSleepWakeupPhrasesChange(index, e.target.value)}
                    placeholder="输入唤醒词组"
                    disabled={disabled}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveSleepWakeupPhrase(index)}
                    disabled={disabled || formData.sleepMode.wakeup.phrases.length <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="retry-limit">重试限制</Label>
            <Input
              id="retry-limit"
              type="number"
              min="0"
              value={formData.sleepMode.wakeup.retryLimit}
              onChange={(e) => handleRetryLimitChange(e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>
      </div>
      
      <Button type="submit" disabled={disabled} className="w-full">
        {disabled ? "保存中..." : "保存配置"}
      </Button>
    </form>
  );
} 