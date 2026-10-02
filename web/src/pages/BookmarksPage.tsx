import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { bookmarksApi, comicsApi } from '@/services/api'
import type { Comic, Bookmark } from '@/types'
import { Bookmark as BookmarkIcon } from 'lucide-react'

export default function BookmarksPage() {
  const [comics, setComics] = useState<Comic[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const bmList = await bookmarksApi.list()
        const allComicIds = bmList.flatMap((b: Bookmark & { comics?: number[] }) => b.comics || [])
        if (allComicIds.length > 0) {
          const comicResults = await Promise.all(allComicIds.map((id: number) => comicsApi.get(id).catch(() => null)))
          setComics(comicResults.filter((c): c is Comic => c !== null))
        }
      } catch {
      } finally {
        setLoading(false)
      }
    }
    fetchBookmarks()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-8 w-8 rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (comics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20" style={{ color: 'var(--text-muted)' }}>
        <BookmarkIcon className="h-16 w-16 mb-4" style={{ color: '#374151' }} />
        <p className="text-lg">还没有收藏任何内容</p>
        <p className="text-sm mt-2">浏览漫画时点击收藏按钮即可添加</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>我的收藏</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {comics.map((comic) => (
          <Link
            key={comic.id}
            to={`/comic/${comic.id}`}
            className="group overflow-hidden rounded-lg border transition-colors"
            style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-surface)' }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-light)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-default)'}
          >
            <div className="aspect-[2/3] overflow-hidden" style={{ backgroundColor: 'var(--bg-surface-hover)' }}>
              <img
                src={comicsApi.getCoverUrl(comic.id, comic.updatedAt)}
                alt={comic.title}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div className="p-2">
              <p className="truncate text-sm" style={{ color: 'var(--text-primary)' }}>{comic.title}</p>
              {comic.author && (
                <p className="truncate text-xs" style={{ color: 'var(--text-muted)' }}>{comic.author}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
