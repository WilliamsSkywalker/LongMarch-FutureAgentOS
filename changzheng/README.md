# LongMarch (长征) - Future-Ready App Generation Platform

> **Natural Language → Full-Stack App → Community Marketplace**

LongMarch is an open-source, community-driven platform where users create functional web applications by simply describing them in natural language. Built with a dark-first desktop-launcher aesthetic, every app is open-source by default and lives in a social marketplace where the community discovers, forks, and remixes each other's creations.

---

## 🎯 Core Philosophy

| Principle | Description |
|-----------|-------------|
| **Vibe Coding** | Describe what you want → AI generates a complete, runnable HTML app |
| **Desktop Launcher UI** | Home page is a grid of app icons — like a game launcher or OS desktop |
| **Open by Default** | Every app is MIT-licensed, forkable, and community-owned |
| **Bilingual (EN/ZH)** | Full i18n support — switch between English and Chinese instantly |
| **Mock Fallback** | Works offline during development — gracefully falls back to mock data |

---

## 🏗 Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   React 19 +    │      │  Express +      │      │   SQLite        │
│   TypeScript    │◄────►│   TypeScript    │◄────►│   (WAL mode)    │
│   + Vite 6      │      │   + better-     │      │                 │
│   + Tailwind    │      │   sqlite3       │      │  users, apps,   │
│   + shadcn/ui   │      │   + JWT Auth    │      │  comments,      │
│                 │      │   + CORS        │      │  likes, favs    │
│  Port: 5173     │      │  Port: 3001     │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

---

## 🚀 Quick Start (Local)

### 1. Clone & Install

```bash
git clone https://github.com/WilliamsSkywalker/LongMarch-FutureAgentOS.git
cd LongMarch-FutureAgentOS

# Frontend
cd changzheng
npm install

# Backend
cd ../server
npm install
```

### 2. Environment Variables

```bash
# Root directory
cp .env.example .env
# Edit .env with your values
```

Key variables:
- `JWT_SECRET` — required for auth
- `OPENAI_API_KEY` — enables real AI generation (demo mode works without it)
- `VITE_API_BASE_URL` — frontend API endpoint

### 3. Run

```bash
# Terminal 1 — Backend
cd server
npm run dev        # http://localhost:3001

# Terminal 2 — Frontend
cd changzheng
npm run dev        # http://localhost:5173
```

The backend auto-creates SQLite tables on first run. The frontend auto-falls back to mock data if the backend is unreachable.

---

## 🌐 Deployment

### Frontend — Vercel

```bash
cd changzheng
vercel --prod
```

`vercel.json` is pre-configured with SPA fallback routes.

### Backend — Railway / Render

```bash
cd server
# Railway
railway up

# Or Render — uses included Dockerfile + Procfile
```

Set environment variables in the platform dashboard (do not commit `.env`).

---

## 📂 Project Structure

```
LongMarch-FutureAgentOS/
├── changzheng/              # Frontend (React 19 + Vite 6)
│   ├── src/
│   │   ├── pages/           # Home, Generator, Community, AppDetail, Profile, Login, Register
│   │   ├── components/      # Layout, Navbar, ThemeToggle, GeneratorProgress, MockAppRunner
│   │   ├── lib/             # API client, toast utility
│   │   ├── i18n/            # LanguageProvider + translations (EN/ZH)
│   │   └── data/            # Mock data for offline development
│   ├── vercel.json          # Vercel deployment config
│   └── vite.config.ts
├── server/                  # Backend (Express + TypeScript)
│   ├── src/
│   │   ├── routes/          # auth.ts, apps.ts, ai.ts
│   │   ├── db.ts            # SQLite schema + connection
│   │   └── index.ts         # Express app entry
│   ├── Dockerfile           # Container build
│   ├── Procfile             # Railway/Render process
│   └── tsconfig.json
├── .env.example             # Environment variable template
└── README.md
```

---

## 🔑 API Routes

| Route | Description | Auth |
|-------|-------------|------|
| `POST /auth/register` | Create account | No |
| `POST /auth/login` | Login → JWT | No |
| `GET /auth/me` | Get current user | Yes |
| `PUT /auth/me` | Update profile | Yes |
| `GET /apps` | List apps (with filters) | No |
| `POST /apps` | Create app | Yes |
| `GET /apps/:id` | Get app details | No |
| `POST /apps/:id/like` | Like app | Yes |
| `DELETE /apps/:id/like` | Unlike app | Yes |
| `POST /apps/:id/favorite` | Favorite app | Yes |
| `DELETE /apps/:id/favorite` | Unfavorite app | Yes |
| `POST /apps/:id/fork` | Fork app | Yes |
| `GET /apps/:id/comments` | List comments | No |
| `POST /apps/:id/comments` | Post comment | Yes |
| `POST /api/ai/generate` | AI generate app | Yes |

---

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#8B1A1A` | Brand color, buttons, accents |
| Accent | `#D4A843` | Highlights, stars, gold elements |
| Background | `#0a0a0a` | Page background |
| Surface | `#141414` | Cards, panels, code blocks |
| Text | `#fafafa` | Primary text |
| Muted | `#a1a1aa` | Secondary text |

---

## 🧪 AI Generation Modes

| Mode | Trigger | Output |
|------|---------|--------|
| **Real** | `OPENAI_API_KEY` is set | Calls OpenAI-compatible LLM with structured prompt |
| **Demo** | No API key | Keyword-matched template from 6 built-in demos (archive, calculator, timeline, dashboard, todo, portfolio) |

Both modes return a JSON object with `{ code: [{filename, content}], preview_html, mode }`.

---

## 📝 License

All apps generated through LongMarch are MIT-licensed by default. The platform code itself is open-source under MIT.

---

Built with the future in mind. 🚀
