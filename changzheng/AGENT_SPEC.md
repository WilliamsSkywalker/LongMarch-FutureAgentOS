# AGENT_SPEC.md — ChangZheng Demo 协调规范

## 项目路径
/Users/yuyinghao/Documents/Kimi/Workspaces/FutureAgentOS/changzheng

## 用户目标
构建 "ChangZheng"（长征）自然语言应用生成与社区平台的可交互 Demo。包含首页、生成器、社区广场、应用详情、个人中心 5 个页面。

## 当前项目事实
- 技术栈：React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- 路由：react-router（已安装）
- 主题：next-themes（已安装）
- 动画：framer-motion（已安装）
- 图标：lucide-react（已安装）
- 基线：已创建 design/design.md、src/data/mockData.ts、src/components/Layout.tsx、src/App.tsx（路由已配置）、src/index.css（暗色主题）

## 设计决策
- 暗色优先，主色 `#8B1A1A`（深红）
- 使用 shadcn/ui 组件（Button, Card, Badge, Input, Textarea, Tabs, Switch, Dialog, Sheet, Select, Avatar, ScrollArea, Separator, Tooltip, Skeleton 等）
- 所有数据从 src/data/mockData.ts 导入
- 路由：/（Home）、/generate（Generator）、/community（Community）、/app/:id（AppDetail）、/profile（Profile）

## 接口规范
- 共享组件必须接受 design.md 中定义的 props
- AppCard 组件：接收 AppItem 对象，展示卡片
- CodeViewer 组件：接收 code 数组，展示文件标签和代码内容
- MockAppRunner 组件：接收 previewHtml 字符串，用 iframe 或 div 渲染
- Layout.tsx 已存在，包含 Navbar + Footer 占位

## 任务切片

### 切片1: 首页 + Footer（worker: home-footer）
- 实现：src/pages/Home.tsx（完整首页，包含 Hero、Features、Showcase、Manifesto 区块）
- 实现：src/components/Footer.tsx（页脚组件）
- 可编辑：src/pages/Home.tsx, src/components/Footer.tsx
- 不可编辑：Layout.tsx, App.tsx, index.css, mockData.ts
- 验证：确保页面能渲染，无 TypeScript 错误

### 切片2: 生成器 + 进度组件（worker: generator）
- 实现：src/pages/Generator.tsx（4步生成流程：Describe → Configure → Generate → Result）
- 实现：src/components/GeneratorProgress.tsx（生成进度动画组件）
- 实现：src/components/MockAppRunner.tsx（模拟应用运行，渲染 previewHtml）
- 可编辑：src/pages/Generator.tsx, src/components/GeneratorProgress.tsx, src/components/MockAppRunner.tsx
- 不可编辑：Layout.tsx, App.tsx, index.css, mockData.ts, Footer.tsx, Home.tsx
- 验证：确保生成流程能完整走通，动画正常

### 切片3: 社区 + 详情 + 个人中心 + 共享组件（worker: community-pages）
- 实现：src/pages/Community.tsx（社区广场，网格+搜索+筛选）
- 实现：src/pages/AppDetail.tsx（应用详情，运行区+代码+评论）
- 实现：src/pages/Profile.tsx（个人中心，Tab 切换）
- 实现：src/components/AppCard.tsx（应用卡片）
- 实现：src/components/CodeViewer.tsx（代码查看器）
- 实现：src/components/Navbar.tsx（导航栏）
- 可编辑：src/pages/Community.tsx, src/pages/AppDetail.tsx, src/pages/Profile.tsx, src/components/AppCard.tsx, src/components/CodeViewer.tsx, src/components/Navbar.tsx
- 不可编辑：Layout.tsx, App.tsx, index.css, mockData.ts, Home.tsx, Footer.tsx, Generator.tsx
- 验证：确保社区网格、详情页、个人中心能正确渲染

## 合并顺序
1. 切片1、2、3 可并行开发（文件不重叠）
2. 主代理整合所有文件，运行 build 验证

## 最终验证
- npm run build 成功无错误
- 所有页面可以正常切换
- 无明显的 UI 断裂或样式问题
