import { Star } from 'lucide-react'
import clsx from 'clsx'

interface StarRatingProps {
  score: number
  maxScore?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onRate?: (score: number) => void
}

export function StarRating({
  score,
  maxScore = 5,
  size = 'md',
  interactive = false,
  onRate,
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxScore }).map((_, i) => {
        const starValue = i + 1
        const filled = starValue <= score

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate?.(starValue)}
            className={clsx(
              'transition-colors',
              interactive && 'cursor-pointer hover:scale-110'
            )}
          >
            <Star
              className={clsx(
                sizeClasses[size],
                filled
                  ? 'fill-accent-yellow text-accent-yellow'
                  : 'fill-transparent text-gray-600'
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
