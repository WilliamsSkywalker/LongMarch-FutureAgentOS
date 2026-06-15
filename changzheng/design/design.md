# ChangZheng 设计文档

## 产品定位

ChangZheng（长征）是一个面向未来的自然语言应用生成与社区平台。用户通过自然语言描述即可生成可独立运行的应用（纯前端），所有产物全开源、可审计、可 Fork。平台以"民主、开源、零门槛"为底色，面向海外兴趣圈层用户。

---

## 视觉系统

### 品牌色
- **主色（Primary）**: `#8B1A1A` — 深红，取自长征精神，象征力量、决心与革命性
- **主色悬停**: `#6B1313`
- **主色浅色**: `#FDF2F2`
- **辅助色（Accent）**: `#D4A843` — 暗金色，象征荣誉与品质，用于小面积点缀
- **成功色**: `#166534` — 深绿
- **警告色**: `#A16207` — 暗黄

### 暗色模式（默认）
- **背景**: `#0A0A0A` — 极深灰黑，接近纯黑但略带温度
- **表面**: `#141414` — 卡片、面板背景
- **表面 elevated**: `#1A1A1A` — 弹窗、悬浮层
- **文字主色**: `#FAFAFA` — 近白
- **文字次色**: `#A1A1AA` — 灰
- **文字 muted**: `#71717A` — 暗灰
- **边框**: `rgba(255,255,255,0.08)`
- **分隔线**: `rgba(255,255,255,0.06)`

### 亮色模式（可选）
- **背景**: `#FAFAFA`
- **表面**: `#FFFFFF`
- **文字主色**: `#18181B`
- **文字次色**: `#52525B`
- **边框**: `rgba(0,0,0,0.08)`

### 字体
- **标题**: `Inter` (font-weight: 600-800), 英文优先
- **正文**: `Inter` (font-weight: 400-500)
- **中文场景**: 使用系统默认中文字体栈（'PingFang SC', 'Microsoft YaHei', sans-serif）
- **代码**: `JetBrains Mono` 或 `Fira Code`

### 间距系统
- 使用 Tailwind 默认间距，核心容器 `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- 卡片内边距: `p-6`
- 页面顶部导航高度: `64px`
- 区块间距: `py-16` 到 `py-24`

### 圆角
- 卡片: `rounded-xl` (12px)
- 按钮: `rounded-lg` (8px)
- 小标签: `rounded-md` (6px)
- 全圆: `rounded-full` (用于头像、状态点)

### 阴影
- 暗色模式卡片: `shadow-none` 或极微弱内发光（使用 border 区分层级）
- 亮色模式卡片: `shadow-sm` / `shadow-md`
- 悬浮元素: `shadow-lg`

---

## 页面路由

| 路由 | 页面 | 描述 |
|------|------|------|
| `/` | 首页（Home） | 品牌展示、平台介绍、CTA、示例应用 |
| `/generate` | 生成器（Generator） | 自然语言输入、配置、生成、结果 |
| `/community` | 社区广场（Community） | 应用卡片流、搜索、分类、排序 |
| `/app/:id` | 应用详情（AppDetail） | 应用演示、代码、评论、Fork |
| `/profile` | 个人中心（Profile） | 我的应用、收藏、设置 |

---

## 共享组件

### 1. 导航栏（Navbar）
- **位置**: 页面顶部固定
- **高度**: 64px
- **背景**: 暗色 `#0A0A0A/80` + backdrop-blur-md
- **内容**: 
  - 左侧: Logo（文字"ChangZheng" + 小红旗图标）
  - 中间: 导航链接（Home, Generate, Community, Profile）
  - 右侧: 主题切换按钮 + 用户头像（或登录按钮）
- **移动端**: 汉堡菜单 + Sheet 侧滑
- **当前页高亮**: 底部 2px 主色下划线

### 2. 页脚（Footer）
- **背景**: 与页面背景一致，顶部有分隔线
- **内容**:
  - 左侧: 品牌 Logo + 一句 slogan（"The People's Agent OS"）
  - 中间: 快速链接（GitHub, Docs, Community）
  - 右侧: 开源声明（MIT License）
- **底部**: 版权信息 + 隐私政策链接

### 3. 应用卡片（AppCard）
- **尺寸**: 响应式，最小宽度 280px
- **结构**:
  - 顶部: 应用图标/头像（48px）+ 名称 + 作者名
  - 中间: 简介（2-3行截断）+ 标签（Badge）
  - 底部: 使用量、点赞数、Fork数 + 操作按钮
- **悬停效果**: 边框变为主色（微弱发光），轻微上浮 translateY(-2px)
- **点击**: 跳转 `/app/:id`

### 4. 代码查看器（CodeViewer）
- **风格**: 类似 GitHub 代码展示
- **背景**: `#0D0D0D`
- **行号**: 灰色 `#52525B`
- **语法高亮**: 使用简单的 CSS 类高亮（不引入完整 Prism/HLJS 避免依赖膨胀）
- **标签页**: 支持多个文件切换（Tab）
- **复制按钮**: 右上角小按钮

---

## 页面设计

### 页面1: 首页（Home）

#### 区块1: Hero（首屏）
- **背景**: 深色，带微妙的网格/粒子动效（使用 CSS 动画，不引入重型库）
- **内容**:
  - 大标题: "Create Apps with Words"（用一句话创造应用）
  - 副标题: "Describe. Generate. Share. ChangZheng turns your ideas into real, open-source apps — no code required."
  - CTA 按钮组:
    - 主按钮: "Start Creating"（深红背景，白色文字）→ 跳转 `/generate`
    - 次按钮: "Explore Community"（边框按钮）→ 跳转 `/community`
  - 底部: 一行小字展示统计（"1,247 apps created · 342 creators · 100% open source"）
- **右侧/下方**: 一个动画展示的示例界面（模拟生成器界面，有打字效果）

#### 区块2: 功能特性（Features）
- **标题**: "Why ChangZheng?"
- **3列卡片**:
  1. **Zero Code** — "Describe what you want in plain English. ChangZheng builds the app for you."（图标：MessageSquare）
  2. **Fully Open** — "Every app is open-source by default. Inspect, learn, and improve."（图标：Code2）
  3. **Community Driven** — "Fork any app, remix it, and share your version."（图标：GitBranch）
- **卡片风格**: 深色背景，左侧有主色竖条装饰，图标使用主色

#### 区块3: 热门应用展示（Showcase）
- **标题**: "Trending Apps"
- **内容**: 横向滚动展示 6-8 个热门应用卡片（使用 AppCard 组件）
- **底部**: "Explore All →" 链接到社区

#### 区块4: 开源宣言（Manifesto）
- **背景**: 主色 `#8B1A1A` 的深色变体（#1a0a0a 或类似），形成视觉节奏变化
- **内容**:
  - 大标题: "Built for the People"
  - 一段宣言文字（约100字），强调开源、民主、零门槛
  - 一个 CTA: "Read Our Manifesto"（边框按钮，白色边框）

#### 区块5: 页脚
- 使用共享 Footer 组件

---

### 页面2: 生成器（Generator）

#### 布局
- 分步表单式布局，顶部有进度指示器
- 步骤: 1.Describe → 2.Configure → 3.Generate → 4.Result

#### 步骤1: Describe（描述需求）
- **大文本输入框**: 占据页面中央，textarea，高度 200px，placeholder: "Describe the app you want to build..."
- **示例提示**: 下方有一排小标签（如 "Fan archive", "Game guide", "Knowledge base"），点击自动填充示例文本
- **按钮**: "Next"（右下角，主色）

#### 步骤2: Configure（配置）
- **表单内容**:
  - App Name: 文本输入
  - Description: 短文本输入
  - Visibility: 公开/私有 Switch
  - Tags: 多选标签（游戏、粉丝、工具、学习等）
- **按钮组**: "Back"（次按钮） + "Generate"（主按钮，大按钮）

#### 步骤3: Generate（生成中）
- **进度展示**:
  - 动画：一个代码生成/打字效果的视觉（进度条 + 日志流）
  - 进度条：4个阶段 — Parsing → Designing → Building → Deploying
  - 每个阶段下方有动态日志文字
  - 预计时间：30-60秒
- **取消按钮**: 次按钮

#### 步骤4: Result（结果）
- **成功状态**:
  - 顶部: 绿色勾选 + "Your app is ready!"
  - 预览区域: 一个 iframe-like 的容器展示应用预览（实际用 div 模拟，Demo 中放静态 HTML）
  - 操作按钮:
    - "Open App"（主按钮）→ 新标签页打开应用
    - "View Code"（次按钮）→ 下方展开 CodeViewer
    - "Share to Community"（边框按钮）→ 发布
    - "Fork & Edit"（边框按钮）→ 进入编辑模式
  - 代码展示区: 折叠面板，默认收起，展开后显示 CodeViewer（包含 HTML/CSS/JS 三个标签）

- **失败状态**:
  - 错误提示 + "Retry" 按钮

---

### 页面3: 社区广场（Community）

#### 布局
- 顶部: 搜索栏 + 筛选/排序控件
- 主体: 应用卡片网格（Grid）
- 右侧（桌面端）: 分类侧边栏

#### 顶部控件
- **搜索栏**: 大尺寸输入框，带 Search 图标，placeholder "Search apps..."
- **排序**: 下拉选择（Trending, Newest, Most Used, Most Forked）
- **分类筛选**: 标签组（All, Fan, Game, Tool, Learning, Other）

#### 应用网格
- 响应式: 移动端1列，平板2列，桌面3列，大屏4列
- 使用 AppCard 组件
- 无限滚动（Demo 使用分页按钮替代）
- 空状态: "No apps yet. Be the first to create one!" + CTA

#### 示例数据（Demo 使用）
至少包含 8-10 个示例应用卡片，覆盖不同类别。

---

### 页面4: 应用详情（AppDetail）

#### 布局
- 顶部: 应用基本信息（大头像、名称、作者、标签、统计）
- 中部: 两栏布局（左侧 2/3 应用运行区，右侧 1/3 信息面板）
- 底部: 评论区 + 相关推荐

#### 顶部信息区
- 应用图标（96px）+ 名称（大标题）+ 作者（小头像+名称）
- 标签行（Badge 组）
- 操作按钮:
  - "Run App"（主按钮，大号）
  - "Fork"（次按钮，带 GitBranch 图标）
  - "Like"（图标按钮，心形）
  - "Share"（图标按钮，分享图标）
- 统计: 使用量、Fork数、点赞数、创建时间

#### 应用运行区
- **Tab 切换**:
  - "Live App" — 模拟应用运行界面（一个 iframe-like 容器，展示应用的实际界面）
  - "Source Code" — CodeViewer 展示完整代码
- **Live App 状态**:
  - 一个带边框的容器，顶部有地址栏模拟（显示 app URL）
  - 容器内展示应用的实际渲染结果（Demo 中用静态 HTML 模拟）
  - 右下角: "Open in New Tab" 按钮（外部链接图标）

#### 右侧信息面板
- **About**: 应用详细描述
- **Tags**: 标签列表
- **License**: MIT（带链接）
- **Creator**: 作者信息卡片（头像、名称、创建时间）
- **Versions**: 版本历史（简化版，显示创建时间和更新次数）
- **Fork Tree**: 来源信息（如果此应用是 Fork 的，显示"Forked from X"）

#### 评论区
- 评论输入框 + 提交按钮
- 评论列表（头像、用户名、时间、内容）
- Demo 使用 3-5 条示例评论

#### 相关推荐
- 底部 "You May Also Like" 区块，展示 3-4 个相关应用卡片

---

### 页面5: 个人中心（Profile）

#### 布局
- 顶部: 用户信息横幅（大背景 + 头像 + 名称 + 简介）
- 中部: Tab 切换（My Apps / Collections / Settings）

#### 用户信息横幅
- 背景: 使用主色渐变或用户自定义背景色（Demo 用默认）
- 内容:
  - 大头像（120px）+ 编辑按钮（悬停显示）
  - 用户名（大标题）
  - 简介（一行）
  - 统计: 创建应用数、获得点赞数、Fork 数

#### Tab: My Apps
- 与社区广场类似的网格，但只展示当前用户的应用
- 每个卡片右上角有编辑/删除按钮（悬停显示）
- 空状态: "You haven't created any apps yet. Create your first app →"

#### Tab: Collections
- 收藏的应用卡片网格
- 空状态: "No collections yet. Browse the community to find apps you love."

#### Tab: Settings（简化）
- 用户名、简介编辑
- 头像上传（用 URL 输入简化）
- 主题偏好（暗色/亮色/跟随系统）
- API 配置（模型选择、API Key 输入 — 简化展示）

---

## 交互与动效

### 全局
- **页面切换**: 使用 react-router 的常规切换，不加页面级过渡动画（保持简洁）
- **滚动**: 平滑滚动（CSS scroll-behavior: smooth）
- **按钮悬停**: 背景色加深/亮度提升，transform scale(1.02)，transition 200ms ease
- **卡片悬停**: 边框颜色变化，translateY(-2px)，shadow 增强

### 生成器进度
- 进度条使用 CSS 动画从左到右填充
- 日志文字逐行出现，带打字机效果（CSS animation）
- 阶段图标：未开始（灰色圆圈）→ 进行中（旋转动画）→ 完成（绿色勾选）

### 代码查看器
- 代码行高亮使用 pre 标签 + 简单 CSS 类（关键字、字符串、注释等颜色区分）
- 标签页切换平滑过渡

### 暗色/亮色切换
- 使用 next-themes（已安装）实现
- 切换时整个页面无闪烁过渡

---

## Mock 数据规范

为了 Demo 展示，需要以下 mock 数据：

### 示例应用（8个）
每个应用包含：id, name, description, author, authorAvatar, icon, tags, likes, uses, forks, createdAt, code, previewHtml

覆盖类别：
1. 粉丝档案类（John可汗百科）
2. 游戏攻略类（Elden Ring 指南）
3. 知识整理类（K-pop 历史）
4. 工具类（Unit Converter）
5. 问答类（Philosophy Q&A）
6. 展示类（Personal Portfolio）
7. 收藏类（Anime Tracker）
8. 数据类（Crypto Dashboard）

### 示例用户（3个）
包含：id, name, avatar, bio, appsCount, likesReceived, forksReceived

### 示例评论（每个应用 2-3 条）
包含：id, user, avatar, content, createdAt

---

## 响应式断点

- **Mobile**: < 640px — 单列布局，汉堡菜单，全宽卡片
- **Tablet**: 640px - 1024px — 2列网格，侧边栏变为顶部
- **Desktop**: 1024px - 1280px — 3列网格，完整布局
- **Wide**: > 1280px — 4列网格，更宽容器

---

## 依赖清单

现有（0-origin 模板已包含）：
- react, react-dom, react-router
- typescript, vite
- tailwindcss, tailwindcss-animate
- shadcn/ui 组件（40+）
- lucide-react（图标）
- next-themes（主题切换）

需新增（主代理安装）：
- **framer-motion** — 用于生成器动画、页面过渡
- **react-markdown** — 用于评论/描述渲染（可选，Demo 可不用）

---

## 文件结构

```
src/
├── pages/
│   ├── Home.tsx          # 首页
│   ├── Generator.tsx     # 生成器
│   ├── Community.tsx    # 社区广场
│   ├── AppDetail.tsx     # 应用详情
│   └── Profile.tsx       # 个人中心
├── components/
│   ├── Navbar.tsx        # 导航栏
│   ├── Footer.tsx        # 页脚
│   ├── AppCard.tsx       # 应用卡片
│   ├── CodeViewer.tsx    # 代码查看器
│   ├── Layout.tsx        # 页面布局（Navbar + Footer 包裹）
│   ├── GeneratorProgress.tsx  # 生成进度动画
│   └── MockAppRunner.tsx # 模拟应用运行
├── data/
│   └── mockData.ts       # 所有 mock 数据
├── lib/
│   └── utils.ts          # 已有
├── main.tsx              # 入口
├── App.tsx               # 路由配置
└── index.css             # 全局样式（含自定义颜色变量）
```

---

## 设计原则总结

1. **暗色优先**：默认暗色模式，契合开发者/技术社区审美
2. **红色力量**：品牌色深红 `#8B1A1A` 克制使用，只在关键交互点和品牌标识出现，避免过度政治化
3. **开源透明**：代码查看、Fork 链、MIT 声明等开源元素在视觉上突出
4. **简洁克制**：避免过度装饰，用留白和排版建立层次
5. **功能清晰**：每个页面有明确的单一目标，不堆叠功能
