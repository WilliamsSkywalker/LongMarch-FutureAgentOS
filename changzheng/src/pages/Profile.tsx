import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import {
  FolderOpen,
  Bookmark,
  Settings,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import AppCard from '@/components/AppCard'
import { getMe, getUserApps, getUserFavorites, updateMe, type User, type AppItem } from '@/lib/api'
import { useTranslation } from '@/i18n/translations'

export default function Profile() {
  const [user, setUser] = useState<User | null>(null)
  const [myApps, setMyApps] = useState<AppItem[]>([])
  const [collectedApps, setCollectedApps] = useState<AppItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showApiKey, setShowApiKey] = useState(false)
  const [editName, setEditName] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editAvatar, setEditAvatar] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const { t } = useTranslation()

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const { user: me } = await getMe()
        const [{ apps: appsData }, { apps: favsData }] = await Promise.all([
          getUserApps(me.id),
          getUserFavorites(me.id),
        ])
        if (!cancelled) {
          setUser(me)
          setEditName(me.name)
          setEditBio(me.bio)
          setEditAvatar(me.avatar || '')
          setMyApps(appsData)
          setCollectedApps(favsData)
        }
      } catch (err: any) {
        if (!cancelled) {
          // 401 means not logged in, show friendly prompt
          if (err.message?.includes('401') || err.message?.includes('Unauthorized') || err.message?.includes('token')) {
            setUser(null)
          } else {
            setError(err instanceof Error ? err.message : t('profileFailedLoad'))
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const handleSaveProfile = async () => {
    setSaving(true)
    setSaveError('')
    try {
      const body: { name?: string; bio?: string; avatar?: string } = {}
      if (editName !== user?.name) body.name = editName
      if (editBio !== user?.bio) body.bio = editBio
      if (editAvatar !== (user?.avatar || '')) body.avatar = editAvatar || undefined

      const { user: updated } = await updateMe(body)
      setUser(updated)
      setEditName(updated.name)
      setEditBio(updated.bio)
      setEditAvatar(updated.avatar || '')
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">{t('profileLoading')}</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">{t('profileLoginTitle')}</h2>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            {t('profileLoginDesc')}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button asChild>
              <Link to="/login">{t('profileLogin')}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/register">{t('profileSignup')}</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-destructive">{error}</div>
      </div>
    )
  }

  const appsCount = myApps.length
  const likesReceived = myApps.reduce((sum, app) => sum + app.likes, 0)
  const forksReceived = myApps.reduce((sum, app) => sum + app.forks, 0)

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="relative bg-gradient-to-b from-[#1a0505] via-[#0f0a0a] to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 md:pt-16 md:pb-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <Avatar className="w-28 h-28 md:w-32 md:h-32 border-4 border-background shadow-xl">
                <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                <AvatarFallback className="text-2xl">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {user.name}
              </h1>
              <p className="text-muted-foreground max-w-lg mb-4">
                {user.bio}
              </p>
              <div className="flex items-center justify-center md:justify-start gap-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-foreground">
                    {appsCount}
                  </div>
                  <div className="text-xs text-muted-foreground">{t('profileApps')}</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-foreground">
                    {likesReceived}
                  </div>
                  <div className="text-xs text-muted-foreground">{t('profileLikes')}</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-foreground">
                    {forksReceived}
                  </div>
                  <div className="text-xs text-muted-foreground">{t('profileForks')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="apps" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="apps" className="gap-2">
              <FolderOpen className="w-4 h-4" />
              {t('profileMyApps')}
            </TabsTrigger>
            <TabsTrigger value="collections" className="gap-2">
              <Bookmark className="w-4 h-4" />
              {t('profileCollections')}
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              {t('profileSettings')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="apps" className="mt-0">
            {myApps.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {myApps.map((app) => (
                  <div key={app.id} className="relative group">
                    <AppCard app={app} />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 bg-background/80 hover:bg-background"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 bg-background/80 hover:bg-background text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-muted-foreground mb-4">
                  You haven't created any apps yet.
                </p>
                <Button>Create your first app</Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="collections" className="mt-0">
            {collectedApps.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {collectedApps.map((app) => (
                  <AppCard key={app.id} app={app} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-muted-foreground">
                  No collections yet. Browse the community to find apps you love.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="mt-0">
            <div className="max-w-2xl">
              <div className="rounded-xl border border-border bg-card p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-1">{t('profileProfile')}</h2>
                  <p className="text-sm text-muted-foreground">
                    {t('profileManageInfo')}
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">{t('profileUsername')}</Label>
                    <Input
                      id="username"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">{t('profileBio')}</Label>
                    <Textarea
                      id="bio"
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avatar">{t('profileAvatar')}</Label>
                    <Input
                      id="avatar"
                      value={editAvatar}
                      onChange={(e) => setEditAvatar(e.target.value)}
                    />
                  </div>
                  {saveError && (
                    <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                      {saveError}
                    </div>
                  )}
                  <Button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="gap-2"
                  >
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {t('loading')}
                      </span>
                    ) : (
                      t('create')
                    )}
                  </Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold mb-1">{t('profileAppearance')}</h2>
                    <p className="text-sm text-muted-foreground">
                      {t('profileChooseTheme')}
                    </p>
                  </div>
                  <RadioGroup defaultValue="dark" className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dark" id="dark" />
                      <Label htmlFor="dark" className="cursor-pointer">
                        {t('profileDark')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="light" id="light" />
                      <Label htmlFor="light" className="cursor-pointer">
                        {t('profileLight')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="system" id="system" />
                      <Label htmlFor="system" className="cursor-pointer">
                        {t('profileSystem')}
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold mb-1">{t('profileAPI')}</h2>
                    <p className="text-sm text-muted-foreground">
                      Your API key for generating apps.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">{t('profileAPIKey')}</Label>
                    <div className="relative">
                      <Input
                        id="apiKey"
                        type={showApiKey ? 'text' : 'password'}
                        defaultValue="sk-changzheng-demo-1234567890abcdef"
                        readOnly
                        className="pr-10"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
