import React from "react"
import { Project } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, MoreVertical, Play, Trash } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ProjectCardProps {
  project: Project
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
  onPlay: (project: Project) => void
}

export function ProjectCard({ project, onEdit, onDelete, onPlay }: ProjectCardProps) {
  // 将orientation转换为显示文本
  const orientationText = project.orientation === 0 ? "横版" : "竖版";
  
  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">{project.name}</h3>
          <p className="text-sm text-gray-500 mb-2">{project.description}</p>
          <Badge variant={project.status === "active" ? "default" : "secondary"}>
            {orientationText}
          </Badge>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(project)}
        >
          <Edit className="h-4 w-4 mr-1" />
          编辑
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(project)}
        >
          <Trash className="h-4 w-4 mr-1" />
          删除
        </Button>
        <Button
          size="sm"
          onClick={() => onPlay(project)}
        >
          <Play className="h-4 w-4 mr-1" />
          播放
        </Button>
      </div>
    </Card>
  )
} 