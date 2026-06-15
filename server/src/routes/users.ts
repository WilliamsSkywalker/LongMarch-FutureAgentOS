import { Router, Request, Response } from 'express'
import { db } from '../db'
import { AuthRequest } from '../middleware/auth'

const router = Router()

// GET /users/:id/apps
// Get all public apps created by a specific user
router.get('/:id/apps', (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id as string, 10)
    if (isNaN(userId)) {
      res.status(400).json({ error: 'Invalid user ID' })
      return
    }

    // Check if user exists
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId)
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const rows = db.prepare(`
      SELECT
        a.id,
        a.uuid,
        a.name,
        a.description,
        u.name AS author_name,
        u.avatar AS author_avatar,
        a.icon,
        a.tags,
        a.likes,
        a.uses,
        a.forks,
        a.created_at
      FROM apps a
      JOIN users u ON a.author_id = u.id
      WHERE a.author_id = ? AND a.is_public = 1
      ORDER BY a.created_at DESC
    `).all(userId) as any[]

    const apps = rows.map((row) => ({
      id: row.id,
      uuid: row.uuid,
      name: row.name,
      description: row.description,
      author_name: row.author_name,
      author_avatar: row.author_avatar,
      icon: row.icon,
      tags: JSON.parse(row.tags || '[]'),
      likes: row.likes,
      uses: row.uses,
      forks: row.forks,
      created_at: row.created_at,
    }))

    const total = apps.length
    res.json({ apps, total })
  } catch (err) {
    console.error('Error fetching user apps:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /users/:id/favorites
router.get('/:id/favorites', (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id as string, 10)
    if (isNaN(userId)) {
      res.status(400).json({ error: 'Invalid user ID' })
      return
    }

    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId)
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const rows = db.prepare(`
      SELECT a.id, a.uuid, a.name, a.description, u.name as author_name, u.avatar as author_avatar,
             a.icon, a.tags, a.likes, a.uses, a.forks, a.created_at
      FROM user_favorites f
      JOIN apps a ON f.app_id = a.id
      JOIN users u ON a.author_id = u.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `).all(userId) as any[]

    const apps = rows.map((row) => ({
      ...row,
      tags: JSON.parse(row.tags || '[]'),
    }))

    res.json({ apps, total: apps.length })
  } catch (err) {
    console.error('Error fetching favorites:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
