import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { ComicGrid } from '@/components/ComicGrid'
import { CategoryTree } from '@/components/CategoryTree'
import { TagCloud } from '@/components/TagCloud'
import { SearchBar } from '@/components/SearchBar'
import { useComicStore } from '@/stores/comicStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { Filter, X } from 'lucide-react'

export default function LibraryPage() {
  const [searchParams] = useSearchParams()
  const { setFilters } = useComicStore()
  const { categories, tags, fetchCategories, fetchTags } = useCategoryStore()
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(
    searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : undefined
  )
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined)
  const [selectedAuthor, setSelectedAuthor] = useState<string | undefined>(undefined)

  useEffect(() => {
    fetchCategories()
    fetchTags()
  }, [])

  useEffect(() => {
    const query = searchParams.get('query')
    const tagId = searchParams.get('tagId')
    const author = searchParams.get('author')
    const params: Record<string, unknown> = {}
    if (query) params.query = query
    if (tagId) {
      params.tagId = Number(tagId)
      setSelectedTagIds([Number(tagId)])
    }
    if (author) {
      params.author = decodeURIComponent(author)
      setSelectedAuthor(decodeURIComponent(author))
    }
    if (Object.keys(params).length > 0) {
      setFilters(params)
    }
  }, [searchParams])

  const handleCategorySelect = (id: number) => {
    const newId = selectedCategoryId === id ? undefined : id
    setSelectedCategoryId(newId)
    setFilters({ categoryId: newId, page: 1 })
  }

  const handleTagSelect = (id: number) => {
    setSelectedTagIds((prev) => {
      const next = prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
      setFilters({ tagId: next.length > 0 ? next[0] : undefined, page: 1 })
      return next
    })
  }

  const handleStatusSelect = (status: string) => {
    const newStatus = selectedStatus === status ? undefined : status
    setSelectedStatus(newStatus)
    setFilters({ status: newStatus as 'ongoing' | 'completed' | 'unknown' | undefined, page: 1 })
  }

  const handleSearch = (query: string) => {
    setFilters({ query, page: 1 })
  }

  const clearFilters = () => {
    setSelectedCategoryId(undefined)
    setSelectedTagIds([])
    setSelectedStatus(undefined)
    setSelectedAuthor(undefined)
    setFilters({ categoryId: undefined, tagId: undefined, status: undefined, query: undefined, author: undefined, page: 1 })
  }

  const hasActiveFilters = selectedCategoryId || selectedTagIds.length > 0 || selectedStatus || selectedAuthor

  return (
    <div className="flex gap-6">
      <div className="flex-1 space-y-4">
        <div className="flex items-center gap-3">
          <SearchBar onSearch={handleSearch} className="flex-1 max-w-md" />
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
            {hasActiveFilters && (
              <span className="rounded-full bg-primary px-1.5 py-0.5 text-xs" style={{ color: 'var(--text-primary)' }}>
                {(selectedCategoryId ? 1 : 0) + selectedTagIds.length + (selectedStatus ? 1 : 0) + (selectedAuthor ? 1 : 0)}
              </span>
            )}
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
              <h4 className="mb-2 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>状态</h4>
              <div className="flex gap-2">
                {(['ongoing', 'completed', 'unknown'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusSelect(status)}
                    className="rounded-full px-3 py-1 text-xs transition-colors"
                    style={{
                      backgroundColor: selectedStatus === status ? 'var(--primary)' : 'transparent',
                      borderColor: selectedStatus === status ? 'transparent' : 'var(--border-light)',
                      borderWidth: selectedStatus === status ? 0 : 1,
                      borderStyle: 'solid',
                      color: selectedStatus === status ? 'var(--text-primary)' : 'var(--text-secondary)'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedStatus !== status) {
                        e.currentTarget.style.borderColor = 'var(--border-default)'
                        e.currentTarget.style.color = 'var(--text-primary)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedStatus !== status) {
                        e.currentTarget.style.borderColor = 'var(--border-light)'
                        e.currentTarget.style.color = 'var(--text-secondary)'
                      }
                    }}
                  >
                    {status === 'ongoing' ? '连载中' : status === 'completed' ? '已完结' : '未知'}
                  </button>
                ))}
              </div>
            </div>

            {selectedAuthor && (
              <div>
                <h4 className="mb-2 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>作者</h4>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm text-primary" style={{ borderColor: 'var(--primary)', backgroundColor: 'rgba(var(--primary-rgb), 0.1)' }}>
                    {selectedAuthor}
                    <button
                      onClick={() => {
                        setSelectedAuthor(undefined)
                        setFilters({ author: undefined, page: 1 })
                      }}
                      className="ml-1 rounded-full hover:bg-primary/20 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                </div>
              </div>
            )}

            {categories.length > 0 && (
              <div>
                <h4 className="mb-2 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>分类</h4>
                <CategoryTree
                  categories={categories}
                  selectedId={selectedCategoryId}
                  onSelect={handleCategorySelect}
                />
              </div>
            )}

            {tags.length > 0 && (
              <div>
                <h4 className="mb-2 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>标签</h4>
                <TagCloud
                  tags={tags}
                  selectedIds={selectedTagIds}
                  onSelect={handleTagSelect}
                />
              </div>
            )}
          </div>
        )}

        <ComicGrid />
      </div>
    </div>
  )
}
