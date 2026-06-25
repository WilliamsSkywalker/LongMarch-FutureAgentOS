import { Router } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { db } from '../db'
import { PROVIDER_CATALOG, getProviderConfig } from '../lib/provider-catalog'

const router = Router()

// GET /api/providers — List all available providers (public)
router.get('/providers', (req, res) => {
  try {
    const providers = PROVIDER_CATALOG.map(p => ({
      id: p.id,
      name: p.name,
      defaultModel: p.defaultModel,
      models: p.models,
      requiresKey: p.requiresKey,
      description: p.description,
    }))
    res.json({ providers })
  } catch (err: any) {
    console.error('GET /api/providers error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/keys — Get user's saved API keys (no key values, only providers)
router.get('/keys', authMiddleware, (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId
    const keys = db.prepare(
      'SELECT provider, model, is_active, created_at FROM user_api_keys WHERE user_id = ?'
    ).all(userId) as { provider: string; model: string; is_active: number; created_at: string }[]

    res.json({
      keys: keys.map(k => ({
        provider: k.provider,
        model: k.model,
        isActive: k.is_active === 1,
        createdAt: k.created_at,
      })),
    })
  } catch (err: any) {
    console.error('GET /api/keys error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/keys — Set or update an API key
router.post('/keys', authMiddleware, (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId
    const { provider, apiKey, model, baseUrl } = req.body

    if (!provider || !apiKey) {
      res.status(400).json({ error: 'provider and apiKey are required' })
      return
    }

    const providerConfig = getProviderConfig(provider)
    if (!providerConfig) {
      res.status(400).json({ error: 'Unknown provider' })
      return
    }

    // Use provided model or default
    const finalModel = model || providerConfig.defaultModel
    // Use provided baseUrl or default
    const finalBaseUrl = baseUrl || providerConfig.baseUrl

    // Upsert: delete existing, insert new
    db.prepare('DELETE FROM user_api_keys WHERE user_id = ? AND provider = ?').run(userId, provider)
    db.prepare(
      'INSERT INTO user_api_keys (user_id, provider, api_key, model, base_url) VALUES (?, ?, ?, ?, ?)'
    ).run(userId, provider, apiKey, finalModel, finalBaseUrl)

    res.json({
      success: true,
      provider,
      model: finalModel,
      message: 'API key saved successfully',
    })
  } catch (err: any) {
    console.error('POST /api/keys error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE /api/keys/:provider — Delete an API key
router.delete('/keys/:provider', authMiddleware, (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId
    const { provider } = req.params

    db.prepare('DELETE FROM user_api_keys WHERE user_id = ? AND provider = ?').run(userId, provider)

    res.json({ success: true, message: 'API key deleted' })
  } catch (err: any) {
    console.error('DELETE /api/keys/:provider error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
