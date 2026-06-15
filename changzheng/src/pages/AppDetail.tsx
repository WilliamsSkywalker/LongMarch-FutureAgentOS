import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router'
import {
  Heart,
  GitBranch,
  Share2,
  ExternalLink,
  MessageSquare,
  Send,
  ArrowLeft,
  Calendar,
  Link as LinkIcon,
  Eye,
  Play,
  Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import CodeViewer from '@/components/CodeViewer'
import {
  getApp,
  getMe,
  postComment,
  likeApp,
  unlikeApp,
  favoriteApp,
  unfavoriteApp,
  forkApp,
  type AppDetail,
  type Comment,
} from '@/lib/api'
import { useTranslation } from '@/i18n/translations'

export default function AppDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [app, setApp] = useState<AppDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<{ name: string; avatar: string | null } | null>(null)
  const [liked, setLiked] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [commentText, setCommentText] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!id) {
        setError(t('appInvalidId'))
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        setError(null)
        const [appRes, meRes] = await Promise.all([
          getApp(id),
          getMe().catch(() => null),
        ])
        if (!cancelled) {
          setApp(appRes.app)
          setUser(meRes?.user ? { name: meRes.user.name, avatar: meRes.user.avatar } : null)
          setLiked(false)
          setIsFavorited(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : t('appFailedLoad'))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-muted-foreground">{t('loading')}</p>
      </div>
    )
  }

  if (error || !app) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-bold text-foreground mb-4">{t('appNotFoundTitle')}</h1>
        <p className="text-muted-foreground mb-6">
          {error || t('appNotFoundDesc')}
        </p>
        <Button asChild>
          <Link to="/community">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('backToCommunity')}
          </Link>
        </Button>
      </div>
    )
  }

  const handleFork = async () => {
    if (!app || !user) return
    try {
      const res = await forkApp(app.uuid)
      alert(t('appForkedAlert'))
      navigate(`/app/${res.app.uuid}`)
    } catch (err) {
      alert(err instanceof Error ? err.message : t('appFailedFork'))
    }
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      alert(t('appLinkCopied'))
    } catch {
      alert(t('appLinkCopied'))
    }
  }

  const handleLike = async () => {
    if (!app || !user) return
    try {
      if (liked) {
        const res = await unlikeApp(app.uuid)
        setLiked(false)
        setApp((prev) => (prev ? { ...prev, likes: res.likes } : prev))
      } else {
        const res = await likeApp(app.uuid)
        setLiked(true)
        setApp((prev) => (prev ? { ...prev, likes: res.likes } : prev))
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : t('appFailedLike'))
    }
  }

  const handleFavorite = async () => {
    if (!app || !user) return
    try {
      if (isFavorited) {
        await unfavoriteApp(app.uuid)
        setIsFavorited(false)
      } else {
        await favoriteApp(app.uuid)
        setIsFavorited(true)
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : t('appFailedFavorite'))
    }
  }

  const handleSubmitComment = async () => {
    if (!app || !user || !commentText.trim()) return
    try {
      await postComment(app.uuid, commentText.trim())
      setCommentText('')
      const refreshed = await getApp(app.uuid)
      setApp(refreshed.app)
    } catch (err) {
      alert(err instanceof Error ? err.message : t('appFailedComment'))
    }
  }

  const allComments: Comment[] = app.comments || []

  // Inline MockAppRunner for the preview
  const MockAppRunner = ({ html }: { html: string }) => (
    <div className="rounded-xl border border-border overflow-hidden bg-[#0a0a0a]">
      {/* Fake URL bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#141414] border-b border-border">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
        </div>
        <div className="flex-1 mx-3">
          <div className="bg-[#0a0a0a] rounded-md px-3 py-1 text-xs text-muted-foreground flex items-center gap-1.5">
            <ExternalLink className="w-3 h-3" />
            https://changzheng.app/run/{app.id}
          </div>
        </div>
        <Button variant="ghost" size="sm" className="h-6 text-xs gap-1 text-muted-foreground">
          <ExternalLink className="w-3 h-3" />
          Open
        </Button>
      </div>
      {/* Preview */}
      <div
        className="min-h-[400px]"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Top Info Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Icon */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-3xl md:text-4xl font-bold text-primary">
                {app.name.charAt(0)}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {app.name}
              </h1>
              <div className="flex items-center gap-2 mb-4">
                <Avatar className="w-5 h-5">
                  <AvatarImage src={app.author_avatar || undefined} alt={app.author_name} />
                  <AvatarFallback className="text-[10px]">
                    {app.author_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  {app.author_name}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {app.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-5">
                <span className="flex items-center gap-1">
                  <Play className="w-4 h-4" />
                  {app.uses} uses
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {app.likes} likes
                </span>
                <span className="flex items-center gap-1">
                  <GitBranch className="w-4 h-4" />
                  {app.forks} forks
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Created {app.created_at}
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button size="lg" className="gap-2">
                  <Play className="w-4 h-4" />
                  {t('appRun')}
                </Button>
                <Button size="lg" variant="secondary" className="gap-2" onClick={handleFork} disabled={!user}>
                  <GitBranch className="w-4 h-4" />
                  {t('appFork')}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2"
                  onClick={handleLike}
                  disabled={!user}
                >
                  <Heart
                    className={
                      liked
                        ? 'w-4 h-4 fill-primary text-primary'
                        : 'w-4 h-4'
                    }
                  />
                  {liked ? t('appLiked') : t('appLike')}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2"
                  onClick={handleFavorite}
                  disabled={!user}
                >
                  <Star
                    className={
                      isFavorited
                        ? 'w-4 h-4 fill-primary text-primary'
                        : 'w-4 h-4'
                    }
                  />
                  {isFavorited ? t('appFavorited') : t('appFavorite')}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4" />
                  {t('appShare')}
                </Button>
              </div>
              {!user && (
                <p className="text-xs text-muted-foreground mt-2">
                  {t('appLoginToInteract')}
                </p>
              )}
            </div>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Tabs */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="live" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="live" className="gap-2">
                  <Eye className="w-4 h-4" />
                  {t('appLiveApp')}
                </TabsTrigger>
                <TabsTrigger value="code" className="gap-2">
                  <LinkIcon className="w-4 h-4" />
                  {t('appSourceCode')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="live" className="mt-0">
                <MockAppRunner html={app.preview_html} />
              </TabsContent>

              <TabsContent value="code" className="mt-0">
                <CodeViewer code={app.code} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: Info Panel */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-border bg-card p-5 space-y-5">
              <div>
                <h3 className="font-semibold text-sm mb-2">{t('appAbout')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {app.description}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2">{t('appTags')}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {app.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2">{t('appLicense')}</h3>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <LinkIcon className="w-3.5 h-3.5" />
                  MIT License
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h3 className="font-semibold text-sm mb-3">{t('appCreator')}</h3>
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={app.author_avatar || undefined} alt={app.author_name} />
                    <AvatarFallback>{app.author_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{app.author_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Created on {app.created_at}
                    </p>
                  </div>
                </div>
              </div>

              {app.forked_from && (
                <div className="pt-2 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    {t('appForkedFrom')}{' '}
                    <span className="text-foreground font-medium">
                      {app.forked_from}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator className="my-10" />

        {/* Comments Section */}
        <div className="max-w-4xl">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {t('appComments')} ({allComments.length})
          </h2>

          {/* Comment Input */}
          <div className="flex gap-3 mb-8">
            <Avatar className="w-9 h-9 shrink-0">
              <AvatarImage src={user?.avatar || undefined} alt={user?.name || t('navProfile')} />
              <AvatarFallback>{(user?.name || 'U').charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder={user ? t('appWriteComment') : t('appLoginToComment')}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="min-h-[80px] resize-none"
                disabled={!user}
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  className="gap-1"
                  onClick={handleSubmitComment}
                  disabled={!user || !commentText.trim()}
                >
                  <Send className="w-3.5 h-3.5" />
                  {t('appSubmit')}
                </Button>
              </div>
            </div>
          </div>

          {/* Comment List */}
          {allComments.length > 0 ? (
            <div className="space-y-5">
              {allComments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="w-9 h-9 shrink-0">
                    <AvatarImage src={comment.user_avatar || undefined} alt={comment.user_name} />
                    <AvatarFallback>
                      {comment.user_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {comment.user_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {comment.created_at}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t('appNoComments')}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
