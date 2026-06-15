import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '../db'
import { authMiddleware, AuthRequest, JWT_SECRET } from '../middleware/auth'
import { User } from '../types'

const router = Router()

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      res.status(400).json({ error: 'All fields are required' })
      return
    }

    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      res.status(400).json({ error: 'All fields are required' })
      return
    }

    const nameTrimmed = name.trim()
    const emailTrimmed = email.trim()
    const passwordTrimmed = password.trim()

    if (!nameTrimmed || !emailTrimmed || !passwordTrimmed) {
      res.status(400).json({ error: 'All fields are required' })
      return
    }

    const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(emailTrimmed) as any
    if (existingEmail) {
      res.status(409).json({ error: 'Email already exists' })
      return
    }

    const existingName = db.prepare('SELECT id FROM users WHERE name = ?').get(nameTrimmed) as any
    if (existingName) {
      res.status(409).json({ error: 'Name already exists' })
      return
    }

    const passwordHash = await bcrypt.hash(passwordTrimmed, 10)

    const result = db.prepare(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)'
    ).run(nameTrimmed, emailTrimmed, passwordHash)

    const userId = Number(result.lastInsertRowid)

    const token = jwt.sign(
      { userId, email: emailTrimmed },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    const user = db.prepare(
      'SELECT id, name, email, avatar, bio FROM users WHERE id = ?'
    ).get(userId) as User

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar ?? null,
        bio: user.bio ?? '',
      },
    })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ error: 'All fields are required' })
      return
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      res.status(400).json({ error: 'All fields are required' })
      return
    }

    const emailTrimmed = email.trim()
    const passwordTrimmed = password.trim()

    if (!emailTrimmed || !passwordTrimmed) {
      res.status(400).json({ error: 'All fields are required' })
      return
    }

    const user = db.prepare(
      'SELECT id, name, email, password_hash, avatar, bio FROM users WHERE email = ?'
    ).get(emailTrimmed) as any

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }

    const valid = await bcrypt.compare(passwordTrimmed, user.password_hash)
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar ?? null,
        bio: user.bio ?? '',
      },
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/me', authMiddleware, (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      res.status(401).json({ error: 'Invalid or expired token' })
      return
    }

    const user = db.prepare(
      'SELECT id, name, email, avatar, bio FROM users WHERE id = ?'
    ).get(userId) as User | undefined

    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar ?? null,
        bio: user.bio ?? '',
      },
    })
  } catch (err) {
    console.error('Me error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
