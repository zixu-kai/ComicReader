import { useState, useCallback } from 'react'
import { Link } from 'react-router'
import { Dice5, RefreshCw, Library } from 'lucide-react'
import { useComicStore } from '@/stores/comicStore'
import { comicsApi } from '@/services/api'
import type { Comic } from '@/types'

export default function RandomPage() {
  const { fetchRandomComics } = useComicStore()
  const [randomComic, setRandomComic] = useState<Comic | null>(null)
  const [loading, setLoading] = useState(false)

  const handleRandom = useCallback(async () => {
    setLoading(true)
    setRandomComic(null)
    try {
      const comics = await fetchRandomComics(1)
      if (comics.length > 0) {
        setRandomComic(comics[0]!)
      }
    } catch {
      // handled
    }
    setLoading(false)
  }, [fetchRandomComics])

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-6 py-8">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>随机发现</h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>不知道看什么？让命运来选择吧！</p>

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

        {!randomComic && !loading && (
          <div className="py-12 text-center" style={{ color: 'var(--text-muted)' }}>
            <Dice5 className="mx-auto mb-4 h-16 w-16" />
            <p>点击上方按钮开始随机推荐</p>
          </div>
        )}
      </div>
    </div>
  )
}
