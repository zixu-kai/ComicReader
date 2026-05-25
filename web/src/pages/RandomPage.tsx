import { useState, useCallback } from 'react'
import { Link } from 'react-router'
import { Dice5, RefreshCw, BookOpen, Library } from 'lucide-react'
import { useComicStore } from '@/stores/comicStore'
import { useBookStore } from '@/stores/bookStore'
import { comicsApi } from '@/services/api'
import type { Comic, Book } from '@/types'

type RandomType = 'comic' | 'book' | 'any'

export default function RandomPage() {
  const { fetchRandomComics } = useComicStore()
  const { fetchRandomBooks } = useBookStore()
  const [randomComic, setRandomComic] = useState<Comic | null>(null)
  const [randomBook, setRandomBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(false)
  const [randomType, setRandomType] = useState<RandomType>('any')

  const handleRandom = useCallback(async () => {
    setLoading(true)
    setRandomComic(null)
    setRandomBook(null)
    try {
      if (randomType === 'comic' || randomType === 'any') {
        const comics = await fetchRandomComics(1)
        if (comics.length > 0) {
          setRandomComic(comics[0]!)
        }
      }
      if (randomType === 'book' || randomType === 'any') {
        const books = await fetchRandomBooks(1)
        if (books.length > 0) {
          setRandomBook(books[0]!)
        }
      }
      if (randomType === 'any' && !randomComic && !randomBook) {
        const comics = await fetchRandomComics(1)
        const books = await fetchRandomBooks(1)
        if (comics.length > 0) setRandomComic(comics[0]!)
        else if (books.length > 0) setRandomBook(books[0]!)
      }
    } catch {
      // handled
    }
    setLoading(false)
  }, [fetchRandomComics, fetchRandomBooks, randomType])

  const typeOptions: { value: RandomType; label: string; icon: typeof Library }[] = [
    { value: 'any', label: '随机', icon: Dice5 },
    { value: 'comic', label: '漫画', icon: Library },
    { value: 'book', label: '小说', icon: BookOpen },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-6 py-8">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>随机发现</h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>不知道看什么？让命运来选择吧！</p>

        <div className="flex items-center gap-2">
          {typeOptions.map((opt) => {
            const Icon = opt.icon
            return (
              <button
                key={opt.value}
                onClick={() => setRandomType(opt.value)}
                className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm transition-colors"
                style={{
                  backgroundColor: randomType === opt.value ? 'var(--primary)' : 'transparent',
                  borderColor: randomType === opt.value ? 'transparent' : 'var(--border-light)',
                  borderWidth: randomType === opt.value ? 0 : 1,
                  borderStyle: 'solid',
                  color: randomType === opt.value ? 'var(--text-primary)' : 'var(--text-secondary)'
                }}
                onMouseEnter={(e) => {
                  if (randomType !== opt.value) {
                    e.currentTarget.style.borderColor = 'var(--border-default)'
                    e.currentTarget.style.color = 'var(--text-primary)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (randomType !== opt.value) {
                    e.currentTarget.style.borderColor = 'var(--border-light)'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }
                }}
              >
                <Icon className="h-4 w-4" />
                {opt.label}
              </button>
            )
          })}
        </div>

        <button
          onClick={handleRandom}
          disabled={loading}
          className="flex items-center gap-3 rounded-2xl bg-primary px-8 py-4 text-lg font-semibold shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/30 active:scale-95 disabled:opacity-50"
          style={{ color: 'var(--text-primary)' }}
        >
          {loading ? (
            <RefreshCw className="h-6 w-6 animate-spin" />
          ) : (
            <Dice5 className="h-6 w-6" />
          )}
          {loading ? '抽取中...' : '随机推荐'}
        </button>
      </div>

      <div className="flex flex-col items-center gap-6">
        {randomComic && (
          <Link to={`/comic/${randomComic.id}`} className="group w-full max-w-md">
            <div className="overflow-hidden rounded-xl border transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-surface)' }}>
              <div className="flex gap-4 p-4">
                <div className="h-48 w-36 shrink-0 overflow-hidden rounded-lg relative" style={{ backgroundColor: 'var(--bg-surface-hover)' }}>
                  <div className="flex h-full w-full items-center justify-center">
                    <Library className="h-8 w-8" style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <img src={comicsApi.getCoverUrl(randomComic.id, randomComic.updatedAt)} alt="" className="absolute inset-0 h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).remove() }} />
                </div>
                <div className="flex flex-1 flex-col justify-center min-w-0">
                  <span className="mb-1 text-xs text-primary">漫画</span>
                  <h3 className="mb-2 text-lg font-semibold group-hover:text-primary transition-colors truncate" style={{ color: 'var(--text-primary)' }}>
                    {randomComic.title}
                  </h3>
                  {randomComic.author && (
                    <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>{randomComic.author}</p>
                  )}
                  {randomComic.pageCount && (
                    <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>{randomComic.pageCount} 页</p>
                  )}
                </div>
              </div>
            </div>
          </Link>
        )}

        {randomBook && (
          <Link to={`/book/${randomBook.id}`} className="group w-full max-w-md">
            <div className="overflow-hidden rounded-xl border transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-surface)' }}>
              <div className="flex gap-4 p-4">
                <div className="h-48 w-36 shrink-0 overflow-hidden rounded-lg relative" style={{ backgroundColor: 'var(--bg-surface-hover)' }}>
                  <div className="flex h-full w-full items-center justify-center">
                    <BookOpen className="h-8 w-8" style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <img src={`/api/books/${randomBook.id}/cover`} alt="" className="absolute inset-0 h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).remove() }} />
                </div>
                <div className="flex flex-1 flex-col justify-center min-w-0">
                  <span className="mb-1 text-xs text-primary">小说</span>
                  <h3 className="mb-2 text-lg font-semibold group-hover:text-primary transition-colors truncate" style={{ color: 'var(--text-primary)' }}>
                    {randomBook.title}
                  </h3>
                  {randomBook.author && (
                    <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>{randomBook.author}</p>
                  )}
                  <span className="mt-1 inline-block w-fit rounded px-1.5 py-0.5 text-[10px]" style={{ backgroundColor: 'var(--bg-surface-hover)', color: 'var(--text-muted)' }}>
                    {randomBook.format.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {!randomComic && !randomBook && !loading && (
          <div className="py-12 text-center" style={{ color: 'var(--text-muted)' }}>
            <Dice5 className="mx-auto mb-4 h-16 w-16" />
            <p>点击上方按钮开始随机推荐</p>
          </div>
        )}
      </div>
    </div>
  )
}
