import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import AppCard from '@/components/AppCard'
import { listApps, type AppItem } from '@/lib/api'
import { useTranslation, type TranslationKey } from '@/i18n/translations'

const categories: { key: string; label: TranslationKey }[] = [
  { key: 'All', label: 'catAll' },
  { key: 'Fan', label: 'catFan' },
  { key: 'Game', label: 'catGame' },
  { key: 'Tool', label: 'catTool' },
  { key: 'Learning', label: 'catLearning' },
  { key: 'Music', label: 'catMusic' },
  { key: 'Other', label: 'catOther' },
]

type SortOption = 'trending' | 'newest' | 'mostUsed' | 'mostForked'
const sortOptions: { key: SortOption; label: TranslationKey }[] = [
  { key: 'trending', label: 'sortTrending' },
  { key: 'newest', label: 'sortNewest' },
  { key: 'mostUsed', label: 'sortMostUsed' },
  { key: 'mostForked', label: 'sortMostForked' },
]

export default function Community() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState<SortOption>('trending')
  const [apps, setApps] = useState<AppItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const { t } = useTranslation()

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const res = await listApps({
          q: search,
          category: category === 'All' ? undefined : category,
          sort,
          page,
          limit,
        })
        if (!cancelled) {
          setApps(res.apps)
          setTotal(res.total)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : t('commFailedLoad'))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [search, category, sort, page, limit])

  const totalPages = Math.ceil(total / limit)
  const hasMore = page < totalPages

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {t('commTitle')}
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {t('commDesc')}
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder={t('commSearch')}
              className="pl-10 h-12 text-base"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          {/* Category Tags */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Badge
                key={cat.key}
                variant={category === cat.key ? 'default' : 'secondary'}
                className={
                  category === cat.key
                    ? 'cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'cursor-pointer hover:bg-accent'
                }
                onClick={() => {
                  setCategory(cat.key)
                  setPage(1)
                }}
              >
                {t(cat.label)}
              </Badge>
            ))}
          </div>

          {/* Sort Dropdown */}
          <Select
            value={sort}
            onValueChange={(v) => setSort(v as SortOption)}
          >
            <SelectTrigger className="w-40 h-9">
              <SelectValue placeholder={t('sortTrending')} />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((opt) => (
                <SelectItem key={opt.key} value={opt.key}>
                  {t(opt.label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <Spinner className="w-8 h-8 text-primary" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-20">
            <p className="text-destructive text-lg">{error}</p>
          </div>
        )}

        {/* App Grid */}
        {!loading && !error && apps.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {apps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && apps.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              {t('commNoApps')}
            </p>
          </div>
        )}

        {/* Pagination */}
        {hasMore && !loading && !error && (
          <div className="flex justify-center mt-10">
            <Button
              variant="outline"
              onClick={() => setPage((p) => p + 1)}
              className="px-8"
            >
              {t('commLoadMore')}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
