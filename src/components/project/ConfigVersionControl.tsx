"use client";

import { useState } from "react";
import { NodeConfig, GlobalConfig } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { History, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";

interface ConfigVersion {
  id: string;
  nodeConfig: NodeConfig;
  globalConfig: GlobalConfig;
  createdAt: Date;
  description: string;
}

interface ConfigVersionControlProps {
  nodeConfig: NodeConfig;
  globalConfig: GlobalConfig;
  onRestore: (nodeConfig: NodeConfig, globalConfig: GlobalConfig) => void;
  onSaveVersion: (nodeConfig: NodeConfig, globalConfig: GlobalConfig, description: string) => void;
}

export function ConfigVersionControl({
  nodeConfig,
  globalConfig,
  onRestore,
  onSaveVersion,
}: ConfigVersionControlProps) {
  const [versions, setVersions] = useState<ConfigVersion[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [newVersionDescription, setNewVersionDescription] = useState("");

  // 保存新版本
  const handleSaveVersion = () => {
    if (!newVersionDescription.trim()) {
      toast.error("请输入版本描述");
      return;
    }

    const newVersion: ConfigVersion = {
      id: Date.now().toString(),
      nodeConfig: { ...nodeConfig },
      globalConfig: { ...globalConfig },
      createdAt: new Date(),
      description: newVersionDescription,
    };

    setVersions([newVersion, ...versions]);
    setNewVersionDescription("");
    onSaveVersion(nodeConfig, globalConfig, newVersionDescription);
    toast.success("版本保存成功");
  };

  // 恢复版本
  const handleRestoreVersion = (version: ConfigVersion) => {
    onRestore(version.nodeConfig, version.globalConfig);
    toast.success("版本已恢复，请点击保存按钮保存到服务器");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          配置版本控制
        </CardTitle>
        <CardDescription>管理配置的版本历史</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 保存新版本 */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="输入版本描述"
              className="flex-1 px-3 py-2 border rounded-md"
              value={newVersionDescription}
              onChange={(e) => setNewVersionDescription(e.target.value)}
            />
            <Button onClick={handleSaveVersion}>
              <Save className="h-4 w-4 mr-2" />
              保存版本
            </Button>
          </div>

          {/* 版本列表 */}
          <div className="space-y-2">
            {versions.map((version) => (
              <div
                key={version.id}
                className="flex items-center justify-between p-3 border rounded-md"
              >
                <div>
                  <p className="font-medium">{version.description}</p>
                  <p className="text-sm text-gray-500">
                    {version.createdAt.toLocaleString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRestoreVersion(version)}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  恢复
                </Button>
              </div>
            ))}
          </div>

          {versions.length === 0 && (
            <p className="text-center text-gray-500 py-4">
              暂无版本历史
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 