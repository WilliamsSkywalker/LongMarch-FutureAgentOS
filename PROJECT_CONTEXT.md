# LongMarch 项目上下文 — 跨设备迁移文档

> ⚠️ 本文档是开发历史记录，用于在新设备上快速恢复 Kimi Work 的上下文。
> 请把本文档的内容完整复制到新设备上的 Kimi Work 对话中，作为该设备的"起步指令"。

---

## 1. 项目基本信息

- **项目名称**：LongMarch（长征）
- **英文名称**：LongMarch（已统一，不再使用 ChangZheng）
- **Slogan**：The People's Agent OS（人民的智能操作系统）
- **GitHub 仓库**：https://github.com/WilliamsSkywalker/LongMarch-FutureAgentOS
- **仓库所有者是**：WilliamsSkywalker（GitHub 用户名）
- **当前阶段**：原型阶段（Prototype），P0 + P1 接口已完成
- **开源协议**：MIT（LICENSE 文件在仓库根目录）
- **设计理念**：所有应用默认开源，社区 Fork，平台优先于 OS，最终演进为 Agent OS

---

## 2. 技术栈

### 前端（`changzheng/` 目录）
- React 19 + TypeScript 5.x + Vite 6.x
- Tailwind CSS 3.x + shadcn/ui（组件库）
- Framer Motion（动画）+ Lucide React（图标）
- 深色主题为主，primary 色 `#8B1A1A`（深红），accent 色 `#D4A843`（暗金）
- 中英双语系统：i18n/LanguageProvider.tsx + translations.ts

### 后端（`server/` 目录）
- Express 4.x + TypeScript
- better-sqlite3（同步 API）
- bcryptjs（密码哈希）+ jsonwebtoken（JWT 认证）+ cors
- 端口：前端 dev server `5173`，后端 `3001`
- 数据库：SQLite WAL 模式，表：`users`, `apps`, `comments`, `app_likes`, `user_favorites`
- 代码在 `server/src/` 下，编译后运行 `node dist/index.js`

---

## 3. 关键架构决策（你每次和我继续这个项目前需要确认）

1. **平台优先，OS 延后**：先做类似微信小程序的平台，外部 OS 是远期目标
2. **Home 页是桌面启动器**：以方格布局展示用户自己的应用和收藏，类似游戏盒子
3. **所有应用默认 MIT 开源**：用户创建的应用自动公开，支持社区 Fork
4. **前端 API 层有 mock fallback**：`api.ts` 中所有函数在 `localhost:3001` 连接失败时，自动返回 `mockData.ts` 的转换数据，确保前端即使不启动后端也能正常展示
5. **Layout 统一 padding**：`Layout.tsx` 的 `<main>` 有 `pt-16`，所有页面已移除自己的 `pt-16`，避免双重 padding 导致导航栏遮挡
6. **Profile 未登录时友好处理**：`getMe()` 返回 401 时设置 `user=null`，展示"请登录"提示，而非显示 "Failed to fetch"
7. **i18n 完整覆盖**：所有页面、组件、alert 消息都通过 `useTranslation()` 接入翻译，当前默认英文，右上角地球图标切换

---

## 4. 已实现的功能（截至目前）

### P0 接口（完成）
- 用户注册 / 登录 / JWT 认证（7 天过期）
- 应用 CRUD（创建、读取、列表、搜索、过滤、排序）
- 用户应用列表
- 健康检查

### P1 接口（完成）
- 点赞 / 取消点赞
- 收藏 / 取消收藏
- Fork 应用
- 评论（发布 / 查看）
- 用户收藏列表

### 前端（完成）
- 5 个页面：Home（桌面启动器）、Generator（4 步生成）、Community（社区浏览）、AppDetail（应用详情）、Profile（个人中心）
- 共享组件：Navbar、Footer、Layout、AppCard、CodeViewer、GeneratorProgress、MockAppRunner
- 6 步 Generator：Describe → Configure → Generate → Result（模拟进度动画）
- 中英双语切换（EN / 中）
- 所有 API 从 mock 切换到真实调用，同时保留 mock fallback

### 待做（未来）
- AI 真实生成（目前为模拟生成，调用 createApp API 时传递 mock HTML 作为占位符）
- 前端登录/注册表单（目前仅 API 可用，Profile 页登录按钮是 alert 占位）
- 用户设置持久化（用户名、头像、主题偏好）
- 部署到生产环境（Vercel / 其他）
- GitHub OAuth 登录
- CI/CD
- 方案 B（外部 OS / 浏览器插件）

---

## 5. 关键文件路径（在新设备上需要了解）

| 文件 | 作用 |
|------|------|
| `changzheng/src/lib/api.ts` | 所有前端 API 函数，含 mock fallback |
| `changzheng/src/i18n/LanguageProvider.tsx` | 双语 Context |
| `changzheng/src/i18n/translations.ts` | 翻译字典 + useTranslation hook |
| `changzheng/src/components/Layout.tsx` | 统一布局（pt-16 已加） |
| `changzheng/src/data/mockData.ts` | 前端 mock 数据（10 个示例应用） |
| `server/src/index.ts` | 后端入口 |
| `server/src/db.ts` | 数据库连接和表初始化 |
| `server/src/routes/auth.ts` | 认证路由（注册/登录/me） |
| `server/src/routes/apps.ts` | 应用路由（CRUD + P1 交互） |
| `server/src/routes/users.ts` | 用户路由（apps + favorites） |
| `server/src/middleware/auth.ts` | JWT 验证中间件 |
| `server/database.sqlite` | 本地 SQLite 数据库（.gitignore 排除） |

---

## 6. 如何在新设备上起步

### 步骤 1：克隆代码
```bash
git clone https://github.com/WilliamsSkywalker/LongMarch-FutureAgentOS.git
cd LongMarch-FutureAgentOS
```

### 步骤 2：启动后端
```bash
cd server
npm install
npm run build
node dist/index.js
# 后端运行在 http://localhost:3001
```

### 步骤 3：启动前端
```bash
cd changzheng
npm install
npm run dev
# 前端运行在 http://localhost:5173
```

### 步骤 4：恢复 Kimi Work 上下文
**请把本文档的完整内容复制到 Kimi Work 的新对话中**，让 Kimi Work 了解项目历史。

---

## 7. GitHub Token 配置（需手动操作，不随文档同步）

⚠️ **注意**：GitHub Token 保存在本地 `~/.github_token` 文件中，不会同步到其他设备。

在新设备上需要重新配置：

1. 打开 https://github.com/settings/tokens
2. 生成新的 Personal Access Token（或从旧设备复制已有 token）
3. 勾选 `repo` 权限
4. 把 token 粘贴给 Kimi Work（例如："这是我的新 token: ghp_..."）
5. Kimi Work 会执行：
```bash
echo 'ghp_...' > ~/.github_token && chmod 600 ~/.github_token
```
6. 然后配置 git credential：
```bash
cd LongMarch-FutureAgentOS
printf "url=https://github.com/WilliamsSkywalker/LongMarch-FutureAgentOS.git\nusername=WilliamsSkywalker\npassword=ghp_...\n" | git credential approve
```

这样以后 Kimi Work 就能直接帮你 push 了。

---

## 8. 设计文档（已保留）

- `changzheng/design/design.md` — 视觉设计规范（配色、字体、间距）
- `server/AGENT_SPEC.md` — P0 接口规范
- `server/AGENT_SPEC_P1.md` — P1 接口规范

---

## 9. 给 Kimi Work 的提示（复制这段到新设备）

> 这是 LongMarch 项目的开发上下文。GitHub 仓库是 https://github.com/WilliamsSkywalker/LongMarch-FutureAgentOS，所有代码已 push 到 main 分支。
> 
> 当前状态：原型阶段，前端 React + 后端 Express + SQLite，P0/P1 接口全部完成，i18n 中英双语已覆盖所有页面，mock fallback 已确保前端即使后端未启动也能正常展示。
> 
> 用户是 GitHub 账号 WilliamsSkywalker，已授权你保存了 GitHub Token（需要在新设备上重新配置）。
> 
> 请读取 `README.md` 和项目结构，继续开发。当前最优先的待做事项是：AI 真实应用生成（替代模拟生成）、前端登录/注册表单、部署到生产环境。

---

*文档生成时间：2026-06-15*
*生成者：Kimi Work（Orchestrator Agent）*
