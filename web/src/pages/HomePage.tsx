import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { BookOpen, Clock, Dice5, TrendingUp, Library, Play } from 'lucide-react'
import { ComicCard } from '@/components/ComicCard'
import { useComicStore } from '@/stores/comicStore'
import { progressApi, systemApi, comicsApi, chaptersApi } from '@/services/api'
import type { Comic, ReadingProgress, ServerInfo } from '@/types'

interface LastReadInfo {
  comicId: number
  chapterId: number
  page: number
  comicTitle?: string
  chapterTitle?: string
  totalPages?: number
}

export default function HomePage() {
  const { fetchRandomComics } = useComicStore()
  const [continueReading, setContinueReading] = useState<(ReadingProgress & { comic?: Comic })[]>([])
  const [recentComics, setRecentComics] = useState<Comic[]>([])
  const [randomComics, setRandomComics] = useState<Comic[]>([])
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null)
  const [lastRead, setLastRead] = useState<LastReadInfo | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('ownShelfLastRead')
      if (raw) {
        const data = JSON.parse(raw) as LastReadInfo
        if (data.comicId && data.chapterId) {
          comicsApi.get(data.comicId).then((comic) => {
            chaptersApi.list(data.comicId).then((chs) => {
              const ch = chs.find((c) => c.id === data.chapterId)
              setLastRead({
                ...data,
                comicTitle: comic.title,
                chapterTitle: ch?.title || (ch ? `第 ${ch.chapterNumber} 话` : undefined),
                totalPages: ch?.pageCount,
              })
            }).catch(() => setLastRead({ ...data, comicTitle: comic.title }))
          }).catch(() => {})
        }
      }
    } catch {}
  }, [])

  useEffect(() => {
    progressApi.getContinueReading(10).then(async (progressList) => {
      const enriched = await Promise.all(
        progressList.map(async (p) => {
          try {
            const comic = await comicsApi.get(p.comicId)
            return { ...p, comic }
          } catch {
            return p
          }
        })
      )
      setContinueReading(enriched)
    }).catch(() => {})

    comicsApi.list({ page: 1, pageSize: 12, sort: 'createdAt', order: 'desc' })
      .then((res) => setRecentComics(res.data))
      .catch(() => {})

    fetchRandomComics(6).then(setRandomComics).catch(() => {})

    systemApi.getInfo().then(setServerInfo).catch(() => {})
  }, [])

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  return (
    <div className="space-y-8">
      {serverInfo && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-surface)' }}>
            <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <Library className="h-4 w-4" />
              <span className="text-xs">漫画总数</span>
            </div>
            <p className="mt-1 text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{serverInfo.comicsCount}</p>
          </div>
          <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-surface)' }}>
            <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <BookOpen className="h-4 w-4" />
              <span className="text-xs">分类数</span>
            </div>
            <p className="mt-1 text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{serverInfo.categoriesCount}</p>
          </div>
          <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-surface)' }}>
            <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">标签数</span>
            </div>
            <p className="mt-1 text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{serverInfo.tagsCount}</p>
          </div>
          <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-surface)' }}>
            <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <Clock className="h-4 w-4" />
              <span className="text-xs">总大小</span>
            </div>
            <p className="mt-1 text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{formatSize(serverInfo.totalSize)}</p>
          </div>
        </div>
      )}

      {lastRead && lastRead.comicTitle && (
        <Link
          to={`/reader/${lastRead.comicId}/${lastRead.chapterId}?page=${lastRead.page}`}
          className="block rounded-xl border p-4 transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10"
          style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-surface)' }}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Play className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>继续上次阅读</p>
              <p className="truncate text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {lastRead.comicTitle}
                {lastRead.chapterTitle && <span className="ml-1 text-xs" style={{ color: 'var(--text-secondary)' }}>· {lastRead.chapterTitle}</span>}
              </p>
              {lastRead.totalPages && (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>第 {lastRead.page} / {lastRead.totalPages} 页</p>
              )}
            </div>
          </div>
        </Link>
      )}

      {continueReading.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              <Clock className="h-5 w-5 text-primary" />
              继续阅读
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {continueReading.map((item) =>
              item.comic ? (
                <ComicCard key={item.comic.id} comic={item.comic} />
              ) : null
            )}
          </div>
        </section>
      )}

      {recentComics.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              <TrendingUp className="h-5 w-5 text-accent-green" />
              最近添加
            </h2>
            <Link to="/library?sort=createdAt" className="text-sm text-primary hover:text-primary-hover">
              查看全部
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {recentComics.map((comic) => (
              <ComicCard key={comic.id} comic={comic} />
            ))}
          </div>
        </section>
      )}

      {randomComics.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              <Dice5 className="h-5 w-5 text-accent-yellow" />
              随机推荐
            </h2>
            <Link to="/random" className="text-sm text-primary hover:text-primary-hover">
              更多随机
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {randomComics.map((comic) => (
              <ComicCard key={comic.id} comic={comic} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
