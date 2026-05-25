import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router'
import { bookmarksApi, comicsApi, booksApi } from '@/services/api'
import type { Comic, Book, Bookmark } from '@/types'
import { Library, BookOpen, Bookmark as BookmarkIcon } from 'lucide-react'

export default function BookmarksPage() {
  const [, setBookmarks] = useState<Bookmark[]>([])
  const [comics, setComics] = useState<Comic[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'comics' | 'books'>('comics')

  const hasComics = useMemo(() => comics.length > 0, [comics])
  const hasBooks = useMemo(() => books.length > 0, [books])

  useEffect(() => {
    if (!hasComics && hasBooks) {
      setActiveTab('books')
    }
  }, [hasComics, hasBooks])

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const bmList = await bookmarksApi.list()
        setBookmarks(bmList)
        const allComicIds = bmList.flatMap((b: Bookmark & { comics?: number[] }) => b.comics || [])
        const allBookIds = bmList.flatMap((b: Bookmark & { books?: number[] }) => b.books || [])
        if (allComicIds.length > 0) {
          const comicResults = await Promise.all(allComicIds.map((id: number) => comicsApi.get(id).catch(() => null)))
          setComics(comicResults.filter((c): c is Comic => c !== null))
        }
        if (allBookIds.length > 0) {
          const bookResults = await Promise.all(allBookIds.map((id: number) => booksApi.get(id).catch(() => null)))
          setBooks(bookResults.filter((b): b is Book => b !== null))
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

  if (!hasComics && !hasBooks) {
    return (
      <div className="flex flex-col items-center justify-center py-20" style={{ color: 'var(--text-muted)' }}>
        <BookmarkIcon className="h-16 w-16 mb-4" style={{ color: '#374151' }} />
        <p className="text-lg">还没有收藏任何内容</p>
        <p className="text-sm mt-2">浏览漫画或图书时点击收藏按钮即可添加</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>我的收藏</h1>

      {(hasComics || hasBooks) && (
        <div className="flex gap-2">
          {hasComics && (
            <button
              onClick={() => setActiveTab('comics')}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              style={{
                backgroundColor: activeTab === 'comics' ? 'var(--primary)' : 'transparent',
                borderColor: activeTab === 'comics' ? 'transparent' : 'var(--border-light)',
                borderWidth: activeTab === 'comics' ? 0 : 1,
                borderStyle: 'solid',
                color: activeTab === 'comics' ? 'var(--text-primary)' : 'var(--text-secondary)'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'comics') {
                  e.currentTarget.style.color = 'var(--text-primary)'
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'comics') {
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }
              }}
            >
              <Library className="h-4 w-4" />
              漫画 ({comics.length})
            </button>
          )}
          {hasBooks && (
            <button
              onClick={() => setActiveTab('books')}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              style={{
                backgroundColor: activeTab === 'books' ? 'var(--primary)' : 'transparent',
                borderColor: activeTab === 'books' ? 'transparent' : 'var(--border-light)',
                borderWidth: activeTab === 'books' ? 0 : 1,
                borderStyle: 'solid',
                color: activeTab === 'books' ? 'var(--text-primary)' : 'var(--text-secondary)'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'books') {
                  e.currentTarget.style.color = 'var(--text-primary)'
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'books') {
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }
              }}
            >
              <BookOpen className="h-4 w-4" />
              图书 ({books.length})
            </button>
          )}
        </div>
      )}

      {activeTab === 'comics' && hasComics && (
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
      )}

      {activeTab === 'books' && hasBooks && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {books.map((book) => (
            <Link
              key={book.id}
              to={`/book/${book.id}`}
              className="group overflow-hidden rounded-lg border transition-colors"
              style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-surface)' }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-light)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-default)'}
            >
              <div className="aspect-[2/3] overflow-hidden" style={{ backgroundColor: 'var(--bg-surface-hover)' }}>
                {book.coverPath ? (
                  <img
                    src={`/covers/book_${book.id}.webp`}
                    alt={book.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <BookOpen className="h-12 w-12" style={{ color: 'var(--text-muted)' }} />
                  </div>
                )}
              </div>
              <div className="p-2">
                <p className="truncate text-sm" style={{ color: 'var(--text-primary)' }}>{book.title}</p>
                {book.author && (
                  <p className="truncate text-xs" style={{ color: 'var(--text-muted)' }}>{book.author}</p>
                )}
                <span className="mt-1 inline-block rounded px-1.5 py-0.5 text-[10px]" style={{ backgroundColor: 'var(--bg-surface-hover)', color: 'var(--text-muted)' }}>
                  {book.format?.toUpperCase()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {activeTab === 'comics' && !hasComics && hasBooks && (
        <div className="flex flex-col items-center justify-center py-10" style={{ color: 'var(--text-muted)' }}>
          <Library className="h-12 w-12 mb-3" style={{ color: '#374151' }} />
          <p>还没有收藏漫画</p>
        </div>
      )}

      {activeTab === 'books' && !hasBooks && hasComics && (
        <div className="flex flex-col items-center justify-center py-10" style={{ color: 'var(--text-muted)' }}>
          <BookOpen className="h-12 w-12 mb-3" style={{ color: '#374151' }} />
          <p>还没有收藏图书</p>
        </div>
      )}
    </div>
  )
}
