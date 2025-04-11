"use client";

import { Layout } from "@/components/layout/Layout"
import { CreateProjectForm } from "@/components/project/CreateProjectForm"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { toast } from "sonner"

// 定义表单类型
const formSchema = z.object({
  name: z.string().min(2, {
    message: "项目名称至少需要2个字符",
  }),
  description: z.string().min(10, {
    message: "项目描述至少需要10个字符",
  }),
  orientation: z.enum(["0", "1"], {
    required_error: "请选择项目方向",
  }).transform(val => parseInt(val)),
})

type FormValues = z.infer<typeof formSchema>

export default function CreateProjectPage() {
  const router = useRouter()

  const handleSubmit = async (values: FormValues) => {
    try {
      // TODO: 调用API创建项目
      console.log("创建项目:", values)
      
      // 模拟API调用，实际项目中应替换为真实API请求
      // 模拟返回的项目ID
      const projectId = `proj-${Date.now()}`
      
      toast.success("项目创建成功！")
      
      // 重定向到项目配置页面而不是项目列表
      router.push(`/projects/${projectId}/config`)
    } catch (error) {
      console.error("创建项目失败:", error)
      toast.error("创建项目失败，请重试")
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">创建新项目</h1>
          <p className="text-sm text-muted-foreground">
            填写以下信息创建您的AI数字人项目
          </p>
        </div>
        <CreateProjectForm onSubmit={handleSubmit} />
      </div>
    </Layout>
  )
} 