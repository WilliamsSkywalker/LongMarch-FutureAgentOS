# P0 API Specification

## Base
Server: http://localhost:3001
CORS: enabled for localhost:5173

## Auth Routes (`/auth`)

### POST /auth/register
Body: `{ name: string, email: string, password: string }`
Response: `{ token: string, user: { id, name, email, avatar, bio } }`
Errors: 400 (missing fields), 409 (email/name exists), 500

### POST /auth/login
Body: `{ email: string, password: string }`
Response: `{ token: string, user: { id, name, email, avatar, bio } }`
Errors: 400 (missing fields), 401 (invalid credentials), 500

### GET /auth/me
Headers: `Authorization: Bearer <token>`
Response: `{ user: { id, name, email, avatar, bio } }`
Errors: 401 (invalid token), 404 (user not found), 500

## Apps Routes (`/apps`)

### POST /apps
Headers: `Authorization: Bearer <token>` (required)
Body: `{ name: string, description: string, icon?: string, tags?: string[], code?: object[], preview_html?: string, is_public?: boolean, forked_from?: string }`
Response: `{ app: { id, uuid, name, description, author_id, icon, tags, likes, uses, forks, is_public, code, preview_html, forked_from, created_at } }`
Errors: 400 (missing fields), 401 (no auth), 500

### GET /apps/:id
Response: `{ app: { id, uuid, name, description, author_id, author_name, author_avatar, icon, tags, likes, uses, forks, is_public, code, preview_html, forked_from, created_at, comments: [...] } }`
Comments shape: `{ id, user_id, user_name, user_avatar, content, created_at }[]`
Errors: 404 (app not found), 500

### GET /apps
Query params: `?q=search&category=tag&sort=trending|newest|mostUsed|mostForked&page=1&limit=20`
Response: `{ apps: [...], total: number, page: number, limit: number }`
App shape: `{ id, uuid, name, description, author_name, author_avatar, icon, tags, likes, uses, forks, created_at }`
Search: match name, description, tags (all lowercased)
Category: match tag
Sort: trending = weighted (likes + uses*0.5 + forks*2), newest = created_at desc, mostUsed = uses desc, mostForked = forks desc
Pagination: page * limit offset

## Users Routes (`/users`)

### GET /users/:id/apps
Response: `{ apps: [...], total: number }`
App shape: same as GET /apps list, but filtered by author_id

## Shared DB Schema (SQLite, better-sqlite3)

Tables:
- users: id, name, email, password_hash, avatar, bio, created_at, updated_at
- apps: id, uuid, name, description, author_id, icon, tags(JSON), likes, uses, forks, is_public, code(JSON), preview_html, forked_from, created_at, updated_at
- comments: id, app_id, user_id, content, created_at
- app_likes: id, app_id, user_id, created_at
- user_favorites: id, app_id, user_id, created_at

## Shared Code

JWT_SECRET: from `../middleware/auth` export
authMiddleware: `import { authMiddleware, AuthRequest } from '../middleware/auth'`
Database: `import { db } from '../db'`
Types: `import { User, App } from '../types'`

UUID generation: use `crypto.randomUUID()` or `Date.now().toString(36) + Math.random().toString(36).substr(2, 9)`

Note: `tags` and `code` fields are stored as JSON strings in SQLite. Use `JSON.parse()` and `JSON.stringify()` when reading/writing.
