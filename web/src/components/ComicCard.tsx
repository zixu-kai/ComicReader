import { Link } from 'react-router'
import type { Comic } from '@/types'
import { StarRating } from '@/components/StarRating'
import { Check } from 'lucide-react'

interface ComicCardProps {
  comic: Comic
  coverUrl?: string
  selectionMode?: boolean
  selected?: boolean
  onToggleSelect?: () => void
}

export function ComicCard({ comic, coverUrl, selectionMode = false, selected = false, onToggleSelect }: ComicCardProps) {
  const progress = comic.readingProgress
  const progressPercent = progress
    ? Math.round((progress.currentPage / progress.totalPages) * 100)
    : 0

  const handleClick = (e: React.MouseEvent) => {
    if (selectionMode) {
      e.preventDefault()
      onToggleSelect?.()
    }
  }

  return (
    <Link
      to={`/comic/${comic.id}`}
      onClick={handleClick}
      className={`group block overflow-hidden rounded-lg transition-all ${selectionMode ? 'cursor-pointer' : 'hover:ring-2 hover:ring-primary/50 hover:shadow-lg hover:shadow-primary/10'}`}
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

        {selectionMode && (
          <div
            className="absolute top-2 left-2 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors"
            style={{
              borderColor: selected ? 'var(--primary)' : 'rgba(255,255,255,0.7)',
              backgroundColor: selected ? 'var(--primary)' : 'rgba(0,0,0,0.4)',
            }}
          >
            {selected && <Check className="h-3.5 w-3.5 text-white" />}
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
          {comic.rating && comic.rating.score > 0 ? (
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
