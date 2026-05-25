import { useEffect, useState } from 'react'
import { BookGrid } from '@/components/BookGrid'
import { SearchBar } from '@/components/SearchBar'
import { TagCloud } from '@/components/TagCloud'
import { useBookStore } from '@/stores/bookStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { Filter, X } from 'lucide-react'
import type { BookFormat } from '@/types'

export default function BookLibraryPage() {
  const { setFilters } = useBookStore()
  const { tags, fetchTags } = useCategoryStore()
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [selectedFormat, setSelectedFormat] = useState<BookFormat | undefined>(undefined)

  useEffect(() => {
    fetchTags()
  }, [])

  const handleTagSelect = (id: number) => {
    setSelectedTagIds((prev) => {
      const next = prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
      setFilters({ tagId: next.length > 0 ? next[0] : undefined, page: 1 })
      return next
    })
  }

  const handleFormatSelect = (format: BookFormat) => {
    const newFormat = selectedFormat === format ? undefined : format
    setSelectedFormat(newFormat)
    setFilters({ format: newFormat, page: 1 })
  }

  const handleSearch = (query: string) => {
    setFilters({ query, page: 1 })
  }

  const clearFilters = () => {
    setSelectedTagIds([])
    setSelectedFormat(undefined)
    setFilters({ tagId: undefined, format: undefined, query: undefined, page: 1 })
  }

  const hasActiveFilters = selectedTagIds.length > 0 || selectedFormat

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <SearchBar onSearch={handleSearch} placeholder="搜索图书..." className="flex-1 max-w-md" />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors"
          style={{
            borderColor: showFilters || hasActiveFilters ? 'var(--primary)' : 'var(--border-light)',
            backgroundColor: showFilters || hasActiveFilters ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent',
            color: showFilters || hasActiveFilters ? 'var(--primary)' : 'var(--text-secondary)'
          }}
          onMouseEnter={(e) => {
            if (!showFilters && !hasActiveFilters) {
              e.currentTarget.style.borderColor = 'var(--border-default)'
              e.currentTarget.style.color = 'var(--text-primary)'
            }
          }}
          onMouseLeave={(e) => {
            if (!showFilters && !hasActiveFilters) {
              e.currentTarget.style.borderColor = 'var(--border-light)'
              e.currentTarget.style.color = 'var(--text-secondary)'
            }
          }}
        >
          <Filter className="h-4 w-4" />
          筛选
        </button>
      </div>

      {showFilters && (
        <div className="rounded-lg border p-4 space-y-4" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-surface)' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>筛选条件</h3>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover">
                <X className="h-3 w-3" />
                清除全部
              </button>
            )}
          </div>

          <div>
            <h4 className="mb-2 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>格式</h4>
            <div className="flex gap-2">
              {(['epub', 'pdf', 'txt', 'mobi', 'azw3'] as const).map((format) => (
                <button
                  key={format}
                  onClick={() => handleFormatSelect(format)}
                  className="rounded-full px-3 py-1 text-xs transition-colors uppercase"
                  style={{
                    backgroundColor: selectedFormat === format ? 'var(--primary)' : 'transparent',
                    borderColor: selectedFormat === format ? 'transparent' : 'var(--border-light)',
                    borderWidth: selectedFormat === format ? 0 : 1,
                    borderStyle: 'solid',
                    color: selectedFormat === format ? 'var(--text-primary)' : 'var(--text-secondary)'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedFormat !== format) {
                      e.currentTarget.style.borderColor = 'var(--border-default)'
                      e.currentTarget.style.color = 'var(--text-primary)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedFormat !== format) {
                      e.currentTarget.style.borderColor = 'var(--border-light)'
                      e.currentTarget.style.color = 'var(--text-secondary)'
                    }
                  }}
                >
                  {format}
                </button>
              ))}
            </div>
          </div>

          {tags.length > 0 && (
            <div>
              <h4 className="mb-2 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>标签</h4>
              <TagCloud tags={tags} selectedIds={selectedTagIds} onSelect={handleTagSelect} />
            </div>
          )}
        </div>
      )}

      <BookGrid />
    </div>
  )
}
