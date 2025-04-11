import { Hono } from 'hono'
import { prisma } from '@/lib/prisma'

const app = new Hono()

// 用户相关路由
app.get('/users', async (c) => {
  const users = await prisma.user.findMany()
  return c.json(users)
})

// 项目相关路由
app.get('/projects', async (c) => {
  const projects = await prisma.project.findMany()
  return c.json(projects)
})

// 知识库相关路由
app.get('/knowledge-bases', async (c) => {
  const knowledgeBases = await prisma.knowledgeBase.findMany()
  return c.json(knowledgeBases)
})

export const GET = app.fetch
export const POST = app.fetch
export const PUT = app.fetch
export const DELETE = app.fetch 