# 数字人创作平台

一个基于Next.js的数字人创作平台，用于快速构建和部署个性化数字人交互体验。

## 快速开始

1. 安装依赖
```bash
npm install
```

2. 启动开发服务器
```bash
npm run dev
```

3. 打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 部署

1. 构建项目
```bash
npm run build
```

2. 启动生产服务器
```bash
npm run start
```

## 项目结构

- `src/app`: 页面路由和API接口
- `src/components`: UI组件
- `src/hooks`: 自定义React钩子
- `src/contexts`: 上下文管理
- `src/services`: API服务
- `src/types`: TypeScript类型定义
- `public`: 静态资源

## 常见问题排查

### 401 Unauthorized 错误

如果遇到 401 错误，可能是以下原因：

1. 用户未登录或登录会话已过期
   - 解决方案：重新登录系统

2. 认证令牌未正确传递
   - 解决方案：检查 localStorage 中是否有 token，或尝试清除浏览器缓存

3. 后端API权限问题
   - 解决方案：确认当前用户有合适的权限

### 静态资源 404 错误

如果静态资源（如图片）加载失败，请检查：

1. 文件是否存在于正确的路径
   - 默认背景图应位于 `public/images/default-background.jpg`

2. 图片路径是否正确引用
   - 公共资源应使用 `/images/filename.jpg` 格式引用

## 开发指南

1. 添加新页面
   - 在 `src/app` 目录下创建对应的路由文件

2. 添加新组件
   - 在 `src/components` 目录下按功能分类创建

3. 数据流向
   - 状态管理：Context API + Hooks
   - API调用：使用 services 层的函数 