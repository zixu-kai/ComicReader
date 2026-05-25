import { Link } from 'react-router'
import clsx from 'clsx'
import type { Tag } from '@/types'

interface TagCloudProps {
  tags: Tag[]
  selectedIds?: number[]
  onSelect?: (id: number) => void
  linkMode?: boolean
}

export function TagCloud({ tags, selectedIds, onSelect, linkMode = false }: TagCloudProps) {
  if (tags.length === 0) {
    return <div className="py-8 text-center text-sm text-gray-600">暂无标签</div>
  }

  const maxCount = Math.max(...tags.map((t) => t.comicCount ?? 0), 1)

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const isSelected = selectedIds?.includes(tag.id)
        const size = tag.comicCount
          ? Math.max(0.75, 0.75 + (tag.comicCount / maxCount) * 0.5)
          : 0.875

        const content = (
          <span
            className={clsx(
              'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm transition-colors',
              isSelected
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'
            )}
            style={{ fontSize: `${size}rem` }}
          >
            {tag.name}
            {tag.comicCount !== undefined && (
              <span className="text-xs opacity-60">{tag.comicCount}</span>
            )}
          </span>
        )

        if (linkMode) {
          return (
            <Link key={tag.id} to={`/library?tagId=${tag.id}`}>
              {content}
            </Link>
          )
        }

        return (
          <button
            key={tag.id}
            onClick={() => onSelect?.(tag.id)}
            type="button"
          >
            {content}
          </button>
        )
      })}
    </div>
  )
}
