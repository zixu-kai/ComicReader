import { ChevronRight, FolderTree } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'
import type { Category } from '@/types'

interface CategoryTreeProps {
  categories: Category[]
  selectedId?: number
  onSelect?: (id: number) => void
}

export function CategoryTree({ categories, selectedId, onSelect }: CategoryTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const renderTree = (items: Category[], depth = 0) => {
    return items.map((cat) => {
      const hasChildren = cat.children && cat.children.length > 0
      const isExpanded = expandedIds.has(cat.id)
      const isSelected = selectedId === cat.id

      return (
        <div key={cat.id}>
          <div
            className={clsx(
              'flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm cursor-pointer transition-colors',
              isSelected
                ? 'bg-primary/10 text-primary'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            )}
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
            onClick={() => {
              if (hasChildren) toggleExpand(cat.id)
              onSelect?.(cat.id)
            }}
          >
            {hasChildren && (
              <ChevronRight
                className={clsx(
                  'h-3.5 w-3.5 shrink-0 transition-transform',
                  isExpanded && 'rotate-90'
                )}
              />
            )}
            {!hasChildren && <span className="w-3.5" />}
            <FolderTree className="h-3.5 w-3.5 shrink-0 text-gray-500" />
            <span className="flex-1 truncate">{cat.name}</span>
            {cat.comicCount !== undefined && (
              <span className="text-xs text-gray-600">{cat.comicCount}</span>
            )}
          </div>
          {hasChildren && isExpanded && renderTree(cat.children!, depth + 1)}
        </div>
      )
    })
  }

  if (categories.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-gray-600">暂无分类</div>
    )
  }

  return <div className="space-y-0.5">{renderTree(categories)}</div>
}
