import { Router } from 'express'
import { db } from '../db'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { App } from '../types'

const router = Router()

function generateUUID(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
  }
}

// POST /apps — Create a new app
router.post('/', authMiddleware, (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId
    const {
      name,
      description,
      icon,
      tags,
      code,
      preview_html,
      is_public,
      forked_from,
    } = req.body

    if (!name || !description) {
      res.status(400).json({ error: 'name and description are required' })
      return
    }

    const uuid = generateUUID()
    const appIcon = icon ?? 'Box'
    const appTags = JSON.stringify(tags ?? [])
    const appCode = JSON.stringify(code ?? [])
    const appPublic = is_public === undefined ? 1 : is_public ? 1 : 0
    const appPreview = preview_html ?? ''

    let forkedFromId: number | null = null
    if (forked_from) {
      const parent = db.prepare('SELECT id FROM apps WHERE uuid = ?').get(forked_from) as { id: number } | undefined
      if (!parent) {
        res.status(400).json({ error: 'forked_from app not found' })
        return
      }
      forkedFromId = parent.id
    }

    const result = db.prepare(
      `INSERT INTO apps (uuid, name, description, author_id, icon, tags, code, preview_html, is_public, forked_from)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      uuid,
      name,
      description,
      userId,
      appIcon,
      appTags,
      appCode,
      appPreview,
      appPublic,
      forkedFromId
    )

    const app = db.prepare('SELECT * FROM apps WHERE id = ?').get(result.lastInsertRowid) as App

    res.status(201).json({
      app: {
        ...app,
        tags: JSON.parse(app.tags as unknown as string),
        code: JSON.parse(app.code as unknown as string),
      },
    })
  } catch (err: any) {
    console.error('POST /apps error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /apps/:id — Get app details by UUID or numeric ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params
    const isNumeric = /^\d+$/.test(id)

    // Increment uses
    const updateStmt = isNumeric
      ? db.prepare('UPDATE apps SET uses = uses + 1 WHERE id = ?')
      : db.prepare('UPDATE apps SET uses = uses + 1 WHERE uuid = ?')
    updateStmt.run(id)

    const appStmt = isNumeric
      ? db.prepare(`
          SELECT a.*, u.name as author_name, u.avatar as author_avatar
          FROM apps a
          JOIN users u ON a.author_id = u.id
          WHERE a.id = ?
        `)
      : db.prepare(`
          SELECT a.*, u.name as author_name, u.avatar as author_avatar
          FROM apps a
          JOIN users u ON a.author_id = u.id
          WHERE a.uuid = ?
        `)
    const app = appStmt.get(id) as (App & { author_name: string; author_avatar?: string }) | undefined

    if (!app) {
      res.status(404).json({ error: 'App not found' })
      return
    }

    const comments = db.prepare(`
      SELECT c.id, c.user_id, u.name as user_name, u.avatar as user_avatar, c.content, c.created_at
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.app_id = ?
      ORDER BY c.created_at DESC
    `).all(app.id)

    res.json({
      app: {
        ...app,
        tags: JSON.parse(app.tags as unknown as string),
        code: JSON.parse(app.code as unknown as string),
        comments,
      },
    })
  } catch (err: any) {
    console.error('GET /apps/:id error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /apps — List apps with search, filter, sort, pagination
router.get('/', (req, res) => {
  try {
    const q = req.query.q as string | undefined
    const category = req.query.category as string | undefined
    const sort = (req.query.sort as string) || 'trending'
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1)
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 20))
    const offset = (page - 1) * limit

    let whereClause = 'WHERE a.is_public = 1'
    const params: any[] = []

    if (q) {
      whereClause += ' AND (LOWER(a.name) LIKE ? OR LOWER(a.description) LIKE ? OR LOWER(a.tags) LIKE ?)'
      const like = `%${q.toLowerCase()}%`
      params.push(like, like, like)
    }

    if (category) {
      whereClause += ' AND a.tags LIKE ?'
      params.push(`%"${category}"%`)
    }

    let orderClause = ''
    switch (sort) {
      case 'trending':
        orderClause = 'ORDER BY (a.likes + a.uses * 0.5 + a.forks * 2) DESC'
        break
      case 'newest':
        orderClause = 'ORDER BY a.created_at DESC'
        break
      case 'mostUsed':
        orderClause = 'ORDER BY a.uses DESC'
        break
      case 'mostForked':
        orderClause = 'ORDER BY a.forks DESC'
        break
      default:
        orderClause = 'ORDER BY (a.likes + a.uses * 0.5 + a.forks * 2) DESC'
    }

    const countQuery = `SELECT COUNT(*) as total FROM apps a ${whereClause}`
    const { total } = db.prepare(countQuery).get(...params) as { total: number }

    const listQuery = `
      SELECT a.id, a.uuid, a.name, a.description, a.author_id, u.name as author_name, u.avatar as author_avatar,
             a.icon, a.tags, a.likes, a.uses, a.forks, a.created_at
      FROM apps a
      JOIN users u ON a.author_id = u.id
      ${whereClause}
      ${orderClause}
      LIMIT ? OFFSET ?
    `
    const rows = db.prepare(listQuery).all(...params, limit, offset) as Array<
      Omit<App, 'is_public' | 'code' | 'preview_html' | 'forked_from' | 'updated_at'> & { author_name: string; author_avatar?: string }
    >

    const apps = rows.map((row) => ({
      ...row,
      tags: JSON.parse(row.tags as unknown as string),
    }))

    res.json({ apps, total, page, limit })
  } catch (err: any) {
    console.error('GET /apps error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /apps/:id/like — Like an app
router.post('/:id/like', authMiddleware, (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId
    const { id } = req.params

    const app = db.prepare('SELECT id, likes FROM apps WHERE uuid = ?').get(id) as { id: number; likes: number } | undefined
    if (!app) {
      res.status(404).json({ error: 'App not found' })
      return
    }

    const existing = db.prepare('SELECT id FROM app_likes WHERE app_id = ? AND user_id = ?').get(app.id, userId)
    if (existing) {
      res.status(409).json({ error: 'Already liked' })
      return
    }

    db.prepare('INSERT INTO app_likes (app_id, user_id) VALUES (?, ?)').run(app.id, userId)
    db.prepare('UPDATE apps SET likes = likes + 1 WHERE id = ?').run(app.id)

    res.json({ liked: true, likes: app.likes + 1 })
  } catch (err: any) {
    console.error('POST /apps/:id/like error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE /apps/:id/like — Unlike an app
router.delete('/:id/like', authMiddleware, (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId
    const { id } = req.params

    const app = db.prepare('SELECT id, likes FROM apps WHERE uuid = ?').get(id) as { id: number; likes: number } | undefined
    if (!app) {
      res.status(404).json({ error: 'App not found' })
      return
    }

    const existing = db.prepare('SELECT id FROM app_likes WHERE app_id = ? AND user_id = ?').get(app.id, userId)
    if (existing) {
      db.prepare('DELETE FROM app_likes WHERE app_id = ? AND user_id = ?').run(app.id, userId)
      db.prepare('UPDATE apps SET likes = MAX(0, likes - 1) WHERE id = ?').run(app.id)
    }

    const updatedApp = db.prepare('SELECT likes FROM apps WHERE id = ?').get(app.id) as { likes: number }
    res.json({ liked: false, likes: updatedApp.likes })
  } catch (err: any) {
    console.error('DELETE /apps/:id/like error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /apps/:id/favorite — Favorite an app
router.post('/:id/favorite', authMiddleware, (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId
    const { id } = req.params

    const app = db.prepare('SELECT id FROM apps WHERE uuid = ?').get(id) as { id: number } | undefined
    if (!app) {
      res.status(404).json({ error: 'App not found' })
      return
    }

    const existing = db.prepare('SELECT id FROM user_favorites WHERE app_id = ? AND user_id = ?').get(app.id, userId)
    if (existing) {
      res.status(409).json({ error: 'Already favorited' })
      return
    }

    db.prepare('INSERT INTO user_favorites (app_id, user_id) VALUES (?, ?)').run(app.id, userId)
    res.json({ favorited: true })
  } catch (err: any) {
    console.error('POST /apps/:id/favorite error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE /apps/:id/favorite — Unfavorite an app
router.delete('/:id/favorite', authMiddleware, (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId
    const { id } = req.params

    const app = db.prepare('SELECT id FROM apps WHERE uuid = ?').get(id) as { id: number } | undefined
    if (!app) {
      res.status(404).json({ error: 'App not found' })
      return
    }

    db.prepare('DELETE FROM user_favorites WHERE app_id = ? AND user_id = ?').run(app.id, userId)
    res.json({ favorited: false })
  } catch (err: any) {
    console.error('DELETE /apps/:id/favorite error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /apps/:id/fork — Fork an app
router.post('/:id/fork', authMiddleware, (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId
    const { id } = req.params

    const original = db.prepare('SELECT * FROM apps WHERE uuid = ?').get(id) as App | undefined
    if (!original) {
      res.status(404).json({ error: 'App not found' })
      return
    }

    const newUUID = generateUUID()
    const result = db.prepare(
      `INSERT INTO apps (uuid, name, description, author_id, icon, tags, code, preview_html, is_public, forked_from)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      newUUID,
      original.name,
      original.description,
      userId,
      original.icon,
      original.tags,
      original.code,
      original.preview_html,
      1,
      original.id
    )

    db.prepare('UPDATE apps SET forks = forks + 1 WHERE id = ?').run(original.id)

    const newApp = db.prepare('SELECT * FROM apps WHERE id = ?').get(result.lastInsertRowid) as App
    res.status(201).json({
      app: {
        ...newApp,
        tags: JSON.parse(newApp.tags as unknown as string),
        code: JSON.parse(newApp.code as unknown as string),
      },
    })
  } catch (err: any) {
    console.error('POST /apps/:id/fork error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /apps/:id/comments — Post a comment
router.post('/:id/comments', authMiddleware, (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId
    const { id } = req.params
    const { content } = req.body

    if (!content || typeof content !== 'string' || content.trim() === '') {
      res.status(400).json({ error: 'content is required' })
      return
    }

    const app = db.prepare('SELECT id FROM apps WHERE uuid = ?').get(id) as { id: number } | undefined
    if (!app) {
      res.status(404).json({ error: 'App not found' })
      return
    }

    const result = db.prepare('INSERT INTO comments (app_id, user_id, content) VALUES (?, ?, ?)').run(app.id, userId, content.trim())
    const comment = db.prepare(`
      SELECT c.id, c.user_id, u.name as user_name, u.avatar as user_avatar, c.content, c.created_at
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `).get(result.lastInsertRowid) as { id: number; user_id: number; user_name: string; user_avatar?: string; content: string; created_at: string }

    res.status(201).json({ comment })
  } catch (err: any) {
    console.error('POST /apps/:id/comments error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /apps/:id/comments — Get comments for an app
router.get('/:id/comments', (req, res) => {
  try {
    const { id } = req.params

    const app = db.prepare('SELECT id FROM apps WHERE uuid = ?').get(id) as { id: number } | undefined
    if (!app) {
      res.status(404).json({ error: 'App not found' })
      return
    }

    const comments = db.prepare(`
      SELECT c.id, c.user_id, u.name as user_name, u.avatar as user_avatar, c.content, c.created_at
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.app_id = ?
      ORDER BY c.created_at DESC
    `).all(app.id) as { id: number; user_id: number; user_name: string; user_avatar?: string; content: string; created_at: string }[]

    res.json({ comments })
  } catch (err: any) {
    console.error('GET /apps/:id/comments error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
