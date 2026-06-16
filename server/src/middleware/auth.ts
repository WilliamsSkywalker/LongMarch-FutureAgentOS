import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { JwtPayload } from '../types'

const JWT_SECRET = process.env.JWT_SECRET || 'longmarch-dev-secret-2024'

export interface AuthRequest extends Request {
  user?: JwtPayload
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Development mode: auto-authenticate all requests
  if (process.env.DEV_AUTO_LOGIN === 'true') {
    req.user = { userId: 1, email: 'dev@localhost', name: 'Dev User' }
    next()
    return
  }

  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
    req.user = decoded
    next()
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export { JWT_SECRET }
