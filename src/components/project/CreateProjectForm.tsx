import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

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

interface CreateProjectFormProps {
  onSubmit: (values: z.infer<typeof formSchema>) => void
}

export function CreateProjectForm({ onSubmit }: CreateProjectFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      orientation: "0",
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>项目名称</FormLabel>
              <FormControl>
                <Input placeholder="输入项目名称" {...field} />
              </FormControl>
              <FormDescription>
                这是您的项目名称，将显示在项目列表中。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>项目描述</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="输入项目描述"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                简要描述您的项目目标和功能。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="orientation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>项目方向</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="选择项目方向" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="0">横版</SelectItem>
                  <SelectItem value="1">竖版</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                选择项目的显示方向。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">创建项目</Button>
      </form>
    </Form>
  )
} 