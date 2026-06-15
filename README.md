# LongMarch — The People's Agent OS

> **自然语言驱动应用生成 + 社区驱动的开源平台**
>
> 让每个人都能用一句话创造出属于自己的 App。

[中文](README.md) | [English](README_EN.md)

---

## 项目简介

**LongMarch**（长征）是一个基于未来 SOTA 模型的 **Vibe Coding** 社区产品。用户只需用自然语言描述需求，AI 即可生成完整的可运行应用（HTML/CSS/JS）。所有应用默认以 **MIT 开源协议** 发布，支持社区 Fork、修改、分享。

本项目目前处于原型阶段（Prototype），包含前端 SPA 和轻量级后端 API。

---

## 技术栈

### 前端
| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19 | UI 框架 |
| TypeScript | 5.x | 类型安全 |
| Vite | 6.x | 构建工具 |
| Tailwind CSS | 3.x | 样式系统 |
| shadcn/ui | latest | 组件库 |
| Framer Motion | latest | 动画 |
| Lucide React | latest | 图标 |

### 后端
| 技术 | 版本 | 用途 |
|------|------|------|
| Express | 4.x | Web 框架 |
| TypeScript | 5.x | 类型安全 |
| better-sqlite3 | latest | 数据库 |
| bcryptjs | latest | 密码哈希 |
| jsonwebtoken | latest | JWT 认证 |
| cors | latest | 跨域处理 |

---

## 项目结构

```
FutureAgentOS/
├── changzheng/          # 前端（React SPA）
│   ├── src/
│   │   ├── pages/        # 页面（Home, Generator, Community, AppDetail, Profile）
│   │   ├── components/   # 共享组件（Navbar, Footer, AppCard, CodeViewer...）
│   │   ├── i18n/         # 中英双语系统
│   │   ├── lib/          # API 封装（api.ts）
│   │   ├── data/         # Mock 数据（开发时使用）
│   │   └── ...
│   ├── package.json
│   └── vite.config.ts
│
├── server/               # 后端（Express API）
│   ├── src/
│   │   ├── routes/       # 路由（auth, apps, users）
│   │   ├── middleware/   # 中间件（auth.ts）
│   │   ├── db.ts         # 数据库连接
│   │   └── index.ts      # 入口
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore
├── README.md
└── LICENSE               # MIT License
```

---

## 快速开始

### 1. 启动后端

```bash
cd server
npm install
npm run build
npm start
# 或开发模式
npm run dev
```

后端默认运行在 `http://localhost:3001`。

### 2. 启动前端

```bash
cd changzheng
npm install
npm run dev
```

前端默认运行在 `http://localhost:5173`，自动代理到后端。

---

## 功能特性

### 已实现（P0）
- ✅ 用户注册 / 登录 / JWT 认证
- ✅ 应用生成器（4 步流程：描述 → 配置 → 生成 → 结果）
- ✅ 社区应用浏览（搜索、分类、排序、分页）
- ✅ 应用详情页（运行、查看代码、评论）
- ✅ 用户主页（我的应用 + 收藏）
- ✅ 中英双语切换（LanguageProvider + translations）
- ✅ 后端所有 P0 API（Auth, Apps CRUD, User Apps）

### 已实现（P1）
- ✅ 点赞 / 取消点赞
- ✅ 收藏 / 取消收藏
- ✅ Fork 应用
- ✅ 评论（发布 / 查看）
- ✅ 用户收藏列表

### 进行中 / 规划中
- 🔄 AI 真实生成（目前为模拟生成 + Mock 代码）
- 🔄 用户设置持久化
- 🔄 前端登录/注册表单（目前仅 API 可用）
- 🔄 部署到生产环境
- 🔄 GitHub OAuth 登录
- 🔄 CI/CD 自动部署

---

## API 文档

后端 API 文档详见：
- [AGENT_SPEC.md](server/AGENT_SPEC.md) — P0 接口规范
- [AGENT_SPEC_P1.md](server/AGENT_SPEC_P1.md) — P1 接口规范

---

## 开源协议

本项目采用 **MIT License** 开源。

```
MIT License

Copyright (c) 2026 LongMarch Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

> **平台原则**：LongMarch 上的所有应用默认采用 MIT 协议，保持开源、开放、可 Fork。

---

## 贡献指南

欢迎提交 Issue 和 PR！

1. Fork 本仓库
2. 创建 feature 分支：`git checkout -b feature/xxx`
3. 提交更改：`git commit -m 'feat: xxx'`
4. 推送分支：`git push origin feature/xxx`
5. 提交 Pull Request

---

## 联系方式

- GitHub: [github.com/WilliamsSkywalker/LongMarch-FutureAgentOS](https://github.com/WilliamsSkywalker/LongMarch-FutureAgentOS)
-  Slogan: **The People's Agent OS** — 人民的智能操作系统

---

> ⚠️ **免责声明**：本项目处于早期原型阶段，API 和架构可能随时调整。请勿用于生产环境。
