"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { UploadCloud, X } from "lucide-react";
import { toast } from "sonner";

interface BackgroundUploaderProps {
  onUploadSuccess: (url: string, type: "image" | "video") => void;
  disabled?: boolean;
  projectId?: string;
  initialUrl?: string;
  onUpload?: (url: string) => void;
}

export function BackgroundUploader({ 
  onUploadSuccess, 
  disabled = false,
  projectId,
  initialUrl,
  onUpload
}: BackgroundUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(initialUrl || null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  
  // 文件类型验证规则 (根据系统设计文档)
  const allowedImageTypes = ["image/jpeg", "image/png"];
  const allowedVideoTypes = ["video/mp4"];
  const maxImageSize = 5 * 1024 * 1024; // 5MB
  const maxVideoSize = 200 * 1024 * 1024; // 200MB
  
  // 处理完成上传的回调
  const handleUploadComplete = (url: string, type: "image" | "video") => {
    onUploadSuccess(url, type);
    // 如果传入了onUpload回调，也调用它
    if (onUpload) {
      onUpload(url);
    }
  };
  
  // 处理文件上传
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // 重置state
    setPreview(null);
    setMediaType(null);
    
    // 检查文件类型
    if (allowedImageTypes.includes(file.type)) {
      if (file.size > maxImageSize) {
        toast.error(`图片文件过大，请上传小于5MB的图片`);
        event.target.value = "";
        return;
      }
      setMediaType("image");
    } else if (allowedVideoTypes.includes(file.type)) {
      if (file.size > maxVideoSize) {
        toast.error(`视频文件过大，请上传小于200MB的视频`);
        event.target.value = "";
        return;
      }
      setMediaType("video");
    } else {
      toast.error(`不支持的文件类型，请上传 ${allowedImageTypes.map(t => t.split('/')[1]).join('/')} 格式的图片或 ${allowedVideoTypes.map(t => t.split('/')[1]).join('/')} 格式的视频`);
      event.target.value = "";
      return;
    }
    
    // 模拟上传
    setUploading(true);
    
    // 创建本地预览URL
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    
    // 模拟上传延迟
    setTimeout(() => {
      // 实际项目中，这里应该是上传到服务器的代码
      // 现在我们只返回本地预览URL作为演示
      handleUploadComplete(previewUrl, mediaType === "image" ? "image" : "video");
      setUploading(false);
      toast.success(`${mediaType === "image" ? "图片" : "视频"}上传成功`);
    }, 1500);
  };
  
  // 处理取消上传
  const handleCancelUpload = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setMediaType(null);
    setUploading(false);
  };
  
  // 渲染预览
  const renderPreview = () => {
    if (!preview) return null;
    
    return (
      <div className="relative mt-4">
        {mediaType === "image" ? (
          <img
            src={preview}
            alt="背景预览"
            className="w-full h-auto max-h-64 object-contain rounded-md"
          />
        ) : (
          <video
            src={preview}
            controls
            className="w-full h-auto max-h-64 object-contain rounded-md"
          />
        )}
        
        {!uploading && (
          <button
            type="button"
            className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded-full text-white"
            onClick={handleCancelUpload}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="background-file">上传背景素材</Label>
            <div className="mt-2">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="background-file"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${
                    disabled || uploading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      {uploading ? "上传中..." : "点击上传或拖放文件"}
                    </p>
                    <p className="text-xs text-gray-500">
                      支持JPG, PNG图片 (最大5MB) 或 MP4视频 (最大200MB)
                    </p>
                  </div>
                  <Input
                    id="background-file"
                    type="file"
                    accept=".jpg,.jpeg,.png,.mp4"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={disabled || uploading}
                  />
                </label>
              </div>
            </div>
          </div>
          
          {renderPreview()}
          
          {uploading && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full w-3/4 animate-pulse"></div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 