import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Flag, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { register, saveToken } from '@/lib/api'
import { useTranslation } from '@/i18n/translations'

export default function Register() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const validateEmail = (v: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError(t('authUsernameRequired'))
      return
    }
    if (!email.trim() || !validateEmail(email)) {
      setError(t('authInvalidEmail'))
      return
    }
    if (password.length < 6) {
      setError(t('authPasswordTooShort'))
      return
    }
    if (password !== confirmPassword) {
      setError(t('authPasswordMismatch'))
      return
    }

    setLoading(true)
    try {
      const res = await register(name, email, password)
      saveToken(res.token)
      navigate('/')
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('authRegisterFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Flag className="w-6 h-6 text-red-600" />
          <span className="text-xl font-bold tracking-tight">LongMarch</span>
        </div>

        <Card>
          <CardHeader className="space-y-1 pb-4">
            <h1 className="text-xl font-semibold text-center">{t('authRegisterTitle')}</h1>
            <p className="text-sm text-muted-foreground text-center">{t('authRegisterDesc')}</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">{t('authUsername')}</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Alex Chen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('authEmail')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('authPassword')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm">{t('authConfirmPassword')}</Label>
                <Input
                  id="confirm"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t('authRegister')}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {t('authRegister')}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">{t('authHasAccount')}</span>{' '}
              <Link
                to="/login"
                className="text-primary hover:underline font-medium"
              >
                {t('authLoginNow')}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
