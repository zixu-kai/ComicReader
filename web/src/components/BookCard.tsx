import { useState } from 'react'
import { Link } from 'react-router'
import { Book as BookIcon, Star } from 'lucide-react'
import type { Book } from '@/types'

interface BookCardProps {
  book: Book
}

export function BookCard({ book }: BookCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const formatLabel: Record<string, string> = {
    epub: 'EPUB',
    pdf: 'PDF',
    txt: 'TXT',
    mobi: 'MOBI',
    azw3: 'AZW3',
  }

  return (
    <Link
      to={`/book/${book.id}`}
      className="group flex gap-3 rounded-lg border p-3 transition-all"
      style={{
        borderColor: isHovered ? 'var(--border-light)' : 'var(--border-default)',
        backgroundColor: isHovered ? 'var(--bg-surface-hover)' : 'var(--bg-surface)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded" style={{ backgroundColor: 'var(--bg-surface-hover)' }}>
        {book.coverPath ? (
          <img
            src={`/api/books/${book.id}/cover`}
            alt={book.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <BookIcon className="h-8 w-8" style={{ color: 'var(--text-muted)' }} />
          </div>
        )}
        <span className="absolute right-1 top-1 rounded px-1.5 py-0.5 text-[10px] font-medium" style={{ backgroundColor: 'var(--bg-surface-active)', color: 'var(--text-secondary)' }}>
          {formatLabel[book.format] || book.format.toUpperCase()}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <h3 className="line-clamp-2 text-sm font-medium group-hover:text-primary" style={{ color: 'var(--text-primary)' }}>
            {book.title}
          </h3>
          {book.author && (
            <p className="mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>{book.author}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {book.rating && book.rating.score > 0 && (
            <div className="flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{book.rating.score}</span>
            </div>
          )}
          {book.publisher && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{book.publisher}</span>
          )}
        </div>

        {book.readingProgress && !book.readingProgress.isCompleted && (
          <div className="mt-1">
            <div className="h-1 w-full overflow-hidden rounded-full" style={{ backgroundColor: 'var(--border-light)' }}>
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${book.readingProgress.percentage}%` }}
              />
            </div>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{Math.round(book.readingProgress.percentage)}%</span>
          </div>
        )}
      </div>
    </Link>
  )
}
