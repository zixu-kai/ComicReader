import { Link } from 'react-router'
import type { Comic } from '@/types'
import { StarRating } from '@/components/StarRating'

interface ComicCardProps {
  comic: Comic
  coverUrl?: string
}

export function ComicCard({ comic, coverUrl }: ComicCardProps) {
  const progress = comic.readingProgress
  const progressPercent = progress
    ? Math.round((progress.currentPage / progress.totalPages) * 100)
    : 0

  return (
    <Link
      to={`/comic/${comic.id}`}
      className="group block overflow-hidden rounded-lg transition-all hover:ring-2 hover:ring-primary/50 hover:shadow-lg hover:shadow-primary/10"
      style={{ backgroundColor: 'var(--bg-surface)' }}
    >
      <div className="relative overflow-hidden">
        <img
          src={coverUrl || `/api/comics/${comic.id}/cover?t=${comic.updatedAt || comic.id}`}
          alt={comic.title}
          className="comic-cover w-full transform transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {progress && !progress.isCompleted && progressPercent > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: 'rgba(128, 128, 128, 0.5)' }}>
            <div
              className="progress-bar h-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {progress?.isCompleted && (
          <div className="absolute top-2 right-2 rounded bg-accent-green/90 px-1.5 py-0.5 text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
            已完成
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      <div className="p-3">
        <h3 className="truncate text-sm font-medium group-hover:text-primary" style={{ color: 'var(--text-primary)' }}>
          {comic.title}
        </h3>

        {comic.author && (
          <p className="mt-0.5 truncate text-xs" style={{ color: 'var(--text-muted)' }}>{comic.author}</p>
        )}

        <div className="mt-1.5 flex items-center justify-between">
          {comic.rating ? (
            <StarRating score={comic.rating.score} size="sm" />
          ) : (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>未评分</span>
          )}

          {comic.pageCount > 0 && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{comic.pageCount}页</span>
          )}
        </div>
      </div>
    </Link>
  )
}
