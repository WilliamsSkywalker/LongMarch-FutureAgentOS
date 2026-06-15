import { useNavigate } from 'react-router'
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
  Heart,
  Play,
  GitBranch,
  ArrowRight,
  Box,
  type LucideIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/i18n/translations'
import type { AppItem } from '@/lib/api'

const iconMap: Record<string, LucideIcon> = {
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
}

function getAppIcon(iconName: string): LucideIcon {
  return iconMap[iconName] || Box
}

interface AppCardProps {
  app: AppItem
  className?: string
}

export default function AppCard({ app, className }: AppCardProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const Icon = getAppIcon(app.icon)

  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/50 border-border bg-card',
        className
      )}
      onClick={() => navigate(`/app/${app.uuid}`)}
    >
      <CardContent className="p-5 flex flex-col gap-4">
        {/* Top: Icon + Name + Author */}
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground truncate text-base">
              {app.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <Avatar className="w-4 h-4">
                <AvatarImage src={app.author_avatar || undefined} alt={app.author_name} />
                <AvatarFallback className="text-[8px]">
                  {app.author_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                {app.author_name}
              </span>
            </div>
          </div>
        </div>

        {/* Middle: Description + Tags */}
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {app.description}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {app.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Bottom: Stats + Open Button */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" />
              {app.likes}
            </span>
            <span className="flex items-center gap-1">
              <Play className="w-3.5 h-3.5" />
              {app.uses}
            </span>
            <span className="flex items-center gap-1">
              <GitBranch className="w-3.5 h-3.5" />
              {app.forks}
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="opacity-0 group-hover:opacity-100 transition-opacity h-7 px-2 gap-1 text-xs"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/app/${app.uuid}`)
            }}
          >
            {t('cardOpen')}
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
