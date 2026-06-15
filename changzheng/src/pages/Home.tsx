import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router'
import {
  Search,
  Plus,
  Clock,
  Calendar,
  Star,
  FolderOpen,
  Heart,
  Play,
  ArrowUpRight,
  LayoutGrid,
  List,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { getUserApps, getUserFavorites, getMe, type User, type AppItem } from '@/lib/api'
import { useTranslation } from '@/i18n/translations'

// Icon mapping for app icons (same as AppCard)
import {
  Archive,
  Sword,
  Music,
  Calculator,
  Brain,
  Layout,
  Tv,
  TrendingUp,
  Cloud,
  FileText,
  Box,
  type LucideIcon,
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  Archive, Sword, Music, Calculator, Brain, Layout, Tv, TrendingUp, Cloud, FileText,
}

function getAppIcon(iconName: string): LucideIcon {
  return iconMap[iconName] || Box
}

// Desktop app icon — large, square, like a desktop icon or game box art
function DesktopAppIcon({ app, onClick }: { app: AppItem; onClick: () => void }) {
  const Icon = getAppIcon(app.icon)
  const [isHovered, setIsHovered] = useState(false)

  // Generate a deterministic color from app name
  const colors = [
    '#8B1A1A', '#1A4B8B', '#1A8B4B', '#8B5A1A', '#4B1A8B', '#8B1A5A', '#1A8B8B', '#5A8B1A'
  ]
  const colorIndex = app.name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length
  const bgColor = colors[colorIndex]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group cursor-pointer flex flex-col items-center gap-2 select-none"
    >
      {/* Icon container — large rounded square */}
      <div
        className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center transition-all duration-200"
        style={{
          backgroundColor: isHovered ? `${bgColor}40` : `${bgColor}25`,
          border: isHovered ? `2px solid ${bgColor}` : `2px solid transparent`,
          transform: isHovered ? 'scale(1.08) translateY(-4px)' : 'scale(1)',
          boxShadow: isHovered ? `0 8px 32px ${bgColor}30` : '0 2px 8px rgba(0,0,0,0.2)',
        }}
      >
        <Icon 
          className="w-8 h-8 sm:w-10 sm:h-10 transition-transform duration-200" 
          style={{ color: bgColor, transform: isHovered ? 'scale(1.1)' : 'scale(1)' }}
        />
        
        {/* Small play indicator on hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* App name below icon */}
      <div className="text-center max-w-[100px]">
        <p className="text-xs sm:text-sm font-medium text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {app.name}
        </p>
      </div>
    </motion.div>
  )
}

// List view row item
function ListAppItem({ app, onClick }: { app: AppItem; onClick: () => void }) {
  const Icon = getAppIcon(app.icon)
  const colors = [
    '#8B1A1A', '#1A4B8B', '#1A8B4B', '#8B5A1A', '#4B1A8B', '#8B1A5A', '#1A8B8B', '#5A8B1A'
  ]
  const colorIndex = app.name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length
  const bgColor = colors[colorIndex]

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.04] transition-colors border border-transparent hover:border-white/[0.06]"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${bgColor}25` }}
      >
        <Icon className="w-6 h-6" style={{ color: bgColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm text-foreground truncate">{app.name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-1">{app.description}</p>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
        <span className="flex items-center gap-1">
          <Heart className="w-3 h-3" />
          {app.likes}
        </span>
        <span className="flex items-center gap-1">
          <Play className="w-3 h-3" />
          {app.uses}
        </span>
      </div>
      <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { t, lang } = useTranslation()
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [myApps, setMyApps] = useState<AppItem[]>([])
  const [collectedApps, setCollectedApps] = useState<AppItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load user data on mount
  useEffect(() => {
    async function load() {
      try {
        const me = await getMe()
        setCurrentUser(me.user)
        const [apps, favs] = await Promise.all([
          getUserApps(me.user.id),
          getUserFavorites(me.user.id),
        ])
        setMyApps(apps.apps)
        setCollectedApps(favs.apps)
      } catch (err: any) {
        setError(err.message || t('homeFailedLoad'))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // All user apps combined for search
  const allUserApps = useMemo(() => {
    const combined = [...myApps]
    collectedApps.forEach((app) => {
      if (!combined.find((a) => a.id === app.id)) {
        combined.push({ ...app, tags: [...app.tags, t('homeCollectedTag')] })
      }
    })
    return combined
  }, [myApps, collectedApps])

  // Filter by search
  const filteredApps = useMemo(() => {
    if (!search.trim()) return allUserApps
    const q = search.toLowerCase()
    return allUserApps.filter(
      (app) =>
        app.name.toLowerCase().includes(q) ||
        app.description.toLowerCase().includes(q) ||
        app.tags.some((t) => t.toLowerCase().includes(q))
    )
  }, [allUserApps, search])

  // Current date/time for the "desktop" feel
  const now = new Date()
  const locale = lang === 'zh' ? 'zh-CN' : 'en-US'
  const timeStr = now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
  const dateStr = now.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen">
      {/* Desktop background with subtle gradient */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#0a0a0a] via-[#0d0a0a] to-[#0a0d0a]" />

      {/* Top bar — like a desktop taskbar / status bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Left: Date/Time widget */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col">
              <span className="text-2xl font-light text-foreground tracking-tight">{timeStr}</span>
              <span className="text-xs text-muted-foreground">{dateStr}</span>
            </div>
            <div className="sm:hidden flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {timeStr}
            </div>
          </div>

          {/* Center: Search */}
          <div className="flex-1 max-w-md w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('homeSearchPlaceholder')}
                className="pl-10 h-10 bg-white/[0.04] border-white/[0.08] focus:border-primary/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex items-center bg-white/[0.04] rounded-lg p-1 border border-white/[0.08]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white/[0.08] text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white/[0.08] text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <Button
              onClick={() => navigate('/generate')}
              className="gap-2 h-10 bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t('homeNewApp')}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Search results or grouped view */}
        {search.trim() ? (
          <div>
            <h2 className="text-sm font-medium text-muted-foreground mb-4">
              Search Results ({filteredApps.length})
            </h2>
            {filteredApps.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-6 sm:gap-8">
                  {filteredApps.map((app) => (
                    <DesktopAppIcon
                      key={app.id}
                      app={app}
                      onClick={() => navigate(`/app/${app.uuid}`)}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredApps.map((app) => (
                    <ListAppItem
                      key={app.id}
                      app={app}
                      onClick={() => navigate(`/app/${app.uuid}`)}
                    />
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-20">
                <p className="text-muted-foreground">No apps found. Try a different search.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-10">
            {/* My Apps Section */}
            {myApps.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-5">
                  <FolderOpen className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                    {t('homeMyApps')}
                  </h2>
                  <Badge variant="secondary" className="text-xs">{myApps.length}</Badge>
                </div>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-6 sm:gap-8">
                    {myApps.map((app) => (
                      <DesktopAppIcon
                        key={app.id}
                        app={app}
                        onClick={() => navigate(`/app/${app.uuid}`)}
                      />
                    ))}
                    {/* Add new app tile */}
                    <div
                      onClick={() => navigate('/generate')}
                      className="group cursor-pointer flex flex-col items-center gap-2 select-none"
                    >
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-dashed border-white/[0.12] flex items-center justify-center hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 hover:scale-105">
                        <Plus className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <p className="text-xs text-muted-foreground group-hover:text-primary transition-colors max-w-[100px] text-center">
                        {t('homeCreateApp')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {myApps.map((app) => (
                      <ListAppItem
                        key={app.id}
                        app={app}
                        onClick={() => navigate(`/app/${app.uuid}`)}
                      />
                    ))}
                    <div
                      onClick={() => navigate('/generate')}
                      className="flex items-center gap-4 p-3 rounded-xl border border-dashed border-white/[0.08] hover:border-primary/30 hover:bg-primary/5 transition-colors cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-xl border border-dashed border-white/[0.12] flex items-center justify-center">
                        <Plus className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">{t('homeCreateApp')}</p>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Collected Apps Section */}
            {collectedApps.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-5">
                  <Star className="w-4 h-4 text-[#D4A843]" />
                  <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                    {t('homeCollected')}
                  </h2>
                  <Badge variant="secondary" className="text-xs">{collectedApps.length}</Badge>
                </div>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-6 sm:gap-8">
                    {collectedApps.map((app) => (
                      <DesktopAppIcon
                        key={app.id}
                        app={app}
                        onClick={() => navigate(`/app/${app.uuid}`)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {collectedApps.map((app) => (
                      <ListAppItem
                        key={app.id}
                        app={app}
                        onClick={() => navigate(`/app/${app.uuid}`)}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Empty state if no apps at all */}
            {myApps.length === 0 && collectedApps.length === 0 && (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Plus className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">{t('homeEmptyTitle')}</h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  {t('homeEmptyDesc')}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Button onClick={() => navigate('/generate')} className="gap-2">
                    <Plus className="w-4 h-4" />
                    {t('homeCreateApp')}
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/community')}>
                    {t('homeExplore')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom taskbar-like area */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              {allUserApps.length} {t('homeApps')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-2 text-xs text-muted-foreground"
              onClick={() => navigate('/community')}
            >
              <Star className="w-3.5 h-3.5" />
              {t('homeDiscover')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-2 text-xs text-muted-foreground"
              onClick={() => navigate('/profile')}
            >
              <Calendar className="w-3.5 h-3.5" />
              Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Add bottom padding so content isn't hidden by fixed taskbar */}
      <div className="h-14" />
    </div>
  )
}
