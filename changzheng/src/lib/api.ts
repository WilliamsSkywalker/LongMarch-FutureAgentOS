import { mockApps, mockUsers, currentUser } from '@/data/mockData'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

function getToken(): string | null {
  return localStorage.getItem('token')
}

function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ─── Mock data converters ─────────────────────

type MockApp = (typeof mockApps)[number]
type MockUser = (typeof mockUsers)[number]

function toApiItem(mockApp: MockApp): AppItem {
  return {
    id: parseInt(mockApp.id.replace('app-', '')) || 0,
    uuid: mockApp.id,
    name: mockApp.name,
    description: mockApp.description,
    author_name: mockApp.author,
    author_avatar: mockApp.authorAvatar,
    icon: mockApp.icon,
    tags: mockApp.tags,
    likes: mockApp.likes,
    uses: mockApp.uses,
    forks: mockApp.forks,
    created_at: mockApp.createdAt,
  }
}

function toApiDetail(mockApp: MockApp): AppDetail {
  return {
    ...toApiItem(mockApp),
    author_id: parseInt(mockApp.author.replace(/\D/g, '')) || 1,
    is_public: true,
    code: mockApp.code.map((c) => ({ filename: c.filename, content: c.content })),
    preview_html: mockApp.previewHtml,
    forked_from: mockApp.forkedFrom
      ? parseInt(mockApp.forkedFrom.replace('app-', '')) || undefined
      : undefined,
    comments: mockApp.comments.map((c) => ({
      id: parseInt(c.id.replace('c', '')) || 0,
      user_id: parseInt(c.user.replace(/\D/g, '')) || 1,
      user_name: c.user,
      user_avatar: c.avatar,
      content: c.content,
      created_at: c.createdAt,
    })),
  }
}

function toApiUser(mockUser: MockUser): User {
  return {
    id: parseInt(mockUser.id.replace('u', '')) || 1,
    name: mockUser.name,
    email: `${mockUser.name.toLowerCase().replace(/\s/g, '.')}@example.com`,
    avatar: mockUser.avatar,
    bio: mockUser.bio,
  }
}

function isNetworkError(err: unknown): boolean {
  if (!(err instanceof Error)) return false
  return (
    err.message.includes('fetch') ||
    err.message.includes('Network') ||
    err.message.includes('Failed') ||
    err.message.includes('ECONNREFUSED') ||
    err.message.includes('connect')
  )
}

async function apiRequest<T>(
  method: string,
  path: string,
  body?: unknown,
  requireAuth = false,
  timeoutMs = 30000
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...authHeaders(),
  }

  if (!requireAuth) {
    delete headers.Authorization
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      throw new Error(data.error || `HTTP ${res.status}`)
    }

    return data as T
  } catch (err: any) {
    clearTimeout(timeoutId)
    if (err.name === 'AbortError') {
      throw new Error('Request timeout — the server is taking too long to respond')
    }
    throw err
  }
}

// ─── Auth ─────────────────────────────────────

export interface User {
  id: number
  name: string
  email: string
  avatar: string | null
  bio: string
}

export interface AuthResponse {
  token: string
  user: User
}

export function register(name: string, email: string, password: string) {
  return apiRequest<AuthResponse>('POST', '/auth/register', { name, email, password })
}

export function login(email: string, password: string) {
  return apiRequest<AuthResponse>('POST', '/auth/login', { email, password })
}

export function getMe() {
  return apiRequest<{ user: User }>('GET', '/auth/me', undefined, true).catch((err) => {
    if (isNetworkError(err)) {
      return { user: toApiUser(currentUser) }
    }
    throw err
  })
}

export function updateMe(body: { name?: string; bio?: string; avatar?: string }) {
  return apiRequest<{ user: User }>('PUT', '/auth/me', body, true)
}

export function saveToken(token: string) {
  localStorage.setItem('token', token)
}

export function clearToken() {
  localStorage.removeItem('token')
}

// ─── Dev Mode Auto-Login ──────────────────────

if (import.meta.env.VITE_DEV_AUTO_LOGIN === 'true') {
  saveToken('dev-token')
}

// ─── Apps ─────────────────────────────────────

export interface AppItem {
  id: number
  uuid: string
  name: string
  description: string
  author_name: string
  author_avatar: string | null
  icon: string
  tags: string[]
  likes: number
  uses: number
  forks: number
  created_at: string
}

export interface AppDetail extends AppItem {
  author_id: number
  is_public: boolean
  code: { filename: string; content: string }[]
  preview_html: string
  forked_from?: number
  comments: Comment[]
  user_liked?: boolean
  user_favorited?: boolean
}

export interface Comment {
  id: number
  user_id: number
  user_name: string
  user_avatar: string | null
  content: string
  created_at: string
}

export interface AppListResponse {
  apps: AppItem[]
  total: number
  page: number
  limit: number
}

export interface CreateAppBody {
  name: string
  description: string
  icon?: string
  tags?: string[]
  code?: { filename: string; content: string }[]
  preview_html?: string
  is_public?: boolean
  forked_from?: string
}

export interface CreateAppResponse {
  app: AppDetail
}

export function listApps(params?: {
  q?: string
  category?: string
  sort?: string
  page?: number
  limit?: number
}) {
  const query = new URLSearchParams()
  if (params?.q) query.set('q', params.q)
  if (params?.category) query.set('category', params.category)
  if (params?.sort) query.set('sort', params.sort)
  if (params?.page) query.set('page', String(params.page))
  if (params?.limit) query.set('limit', String(params.limit))
  const qs = query.toString()
  return apiRequest<AppListResponse>('GET', `/apps${qs ? '?' + qs : ''}`).catch((err) => {
    if (isNetworkError(err)) {
      let filtered = [...mockApps]
      if (params?.category && params.category !== 'All') {
        filtered = filtered.filter((a) => a.tags.includes(params.category!))
      }
      if (params?.q) {
        const q = params.q.toLowerCase()
        filtered = filtered.filter(
          (a) =>
            a.name.toLowerCase().includes(q) ||
            a.description.toLowerCase().includes(q) ||
            a.tags.some((t) => t.toLowerCase().includes(q))
        )
      }
      const page = params?.page || 1
      const limit = params?.limit || 20
      const start = (page - 1) * limit
      const paginated = filtered.slice(start, start + limit)
      return {
        apps: paginated.map(toApiItem),
        total: filtered.length,
        page,
        limit,
      }
    }
    throw err
  })
}

export function getApp(id: string) {
  return apiRequest<{ app: AppDetail }>('GET', `/apps/${id}`).catch((err) => {
    if (isNetworkError(err)) {
      let found = mockApps.find((a) => a.id === id)
      if (!found) {
        // Try matching numeric id (e.g., "1" -> "app-1")
        found = mockApps.find((a) => a.id === `app-${id}`)
      }
      if (found) {
        return { app: toApiDetail(found) }
      }
    }
    throw err
  })
}

export function createApp(body: CreateAppBody) {
  return apiRequest<CreateAppResponse>('POST', '/apps', body, true)
}

export function likeApp(id: string) {
  return apiRequest<{ liked: boolean; likes: number }>('POST', `/apps/${id}/like`, undefined, true)
}

export function unlikeApp(id: string) {
  return apiRequest<{ liked: boolean; likes: number }>('DELETE', `/apps/${id}/like`, undefined, true)
}

export function favoriteApp(id: string) {
  return apiRequest<{ favorited: boolean }>('POST', `/apps/${id}/favorite`, undefined, true)
}

export function unfavoriteApp(id: string) {
  return apiRequest<{ favorited: boolean }>('DELETE', `/apps/${id}/favorite`, undefined, true)
}

export function forkApp(id: string) {
  return apiRequest<{ app: AppDetail }>('POST', `/apps/${id}/fork`, undefined, true)
}

export function postComment(id: string, content: string) {
  return apiRequest<{ comment: Comment }>('POST', `/apps/${id}/comments`, { content }, true)
}

export function getComments(id: string) {
  return apiRequest<{ comments: Comment[] }>('GET', `/apps/${id}/comments`)
}

// ─── AI ───────────────────────────────────────

export interface AIGenerateResponse {
  code: { filename: string; content: string }[]
  preview_html: string
  mode: 'real' | 'demo'
  message?: string
}

export function generateApp(description: string, name: string, tags?: string[]) {
  return apiRequest<AIGenerateResponse>('POST', '/api/ai/generate', { description, name, tags }, true, 120000)
}

// ─── Users ────────────────────────────────────

export interface UserAppsResponse {
  apps: AppItem[]
  total: number
}

export function getUserApps(userId: number) {
  return apiRequest<UserAppsResponse>('GET', `/users/${userId}/apps`).catch((err) => {
    if (isNetworkError(err)) {
      const apps = mockApps.slice(0, 3)
      return { apps: apps.map(toApiItem), total: apps.length }
    }
    throw err
  })
}

export function getUserFavorites(userId: number) {
  return apiRequest<UserAppsResponse>('GET', `/users/${userId}/favorites`).catch((err) => {
    if (isNetworkError(err)) {
      const apps = mockApps.slice(3, 6)
      return { apps: apps.map(toApiItem), total: apps.length }
    }
    throw err
  })
}

// ─── Health ───────────────────────────────────

export function getHealth() {
  return apiRequest<{ status: string; time: string }>('GET', '/health').catch((err) => {
    if (isNetworkError(err)) {
      return { status: 'mock', time: new Date().toISOString() }
    }
    throw err
  })
}
