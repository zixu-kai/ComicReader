import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { BookOpen, Clock, Dice5, TrendingUp, Library } from 'lucide-react'
import { ComicCard } from '@/components/ComicCard'
import { BookCard } from '@/components/BookCard'
import { useComicStore } from '@/stores/comicStore'
import { useBookStore } from '@/stores/bookStore'
import { progressApi, systemApi, comicsApi, booksApi } from '@/services/api'
import type { Comic, ReadingProgress, ServerInfo, Book } from '@/types'

export default function HomePage() {
  const { fetchRandomComics } = useComicStore()
  const { fetchRandomBooks } = useBookStore()
  const [continueReading, setContinueReading] = useState<(ReadingProgress & { comic?: Comic })[]>([])
  const [continueReadingBooks, setContinueReadingBooks] = useState<Book[]>([])
  const [recentComics, setRecentComics] = useState<Comic[]>([])
  const [randomComics, setRandomComics] = useState<Comic[]>([])
  const [randomBooks, setRandomBooks] = useState<Book[]>([])
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null)

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

    fetchRandomBooks(3).then(setRandomBooks).catch(() => {})

    booksApi.list({ sort: 'lastReadAt', order: 'desc', pageSize: 10, readingStatus: 'reading' })
      .then((res) => setContinueReadingBooks(res.data))
      .catch(() => {})

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

      {continueReadingBooks.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              <BookOpen className="h-5 w-5 text-primary" />
              继续阅读 - 图书
            </h2>
            <Link to="/books?readingStatus=reading" className="text-sm text-primary hover:text-primary-hover">
              查看全部
            </Link>
          </div>
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {continueReadingBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
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

      {randomBooks.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              <BookOpen className="h-5 w-5 text-accent-green" />
              随机图书推荐
            </h2>
            <Link to="/books" className="text-sm text-primary hover:text-primary-hover">
              查看全部
            </Link>
          </div>
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {randomBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
