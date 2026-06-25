import 'dotenv/config'
import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import authRoutes from './routes/auth'
import appsRoutes from './routes/apps'
import usersRoutes from './routes/users'
import aiRoutes from './routes/ai'
import apiKeyRoutes from './routes/api-keys'
import './db'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

// Routes
app.use('/auth', authRoutes)
app.use('/apps', appsRoutes)
app.use('/users', usersRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api', apiKeyRoutes)

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`LongMarch server running on port ${PORT}`)
})
