import { useEffect, useCallback, useState } from 'react'
import { ComicCard } from '@/components/ComicCard'
import { useComicStore } from '@/stores/comicStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { comicsApi } from '@/services/api'
import { StarRating } from '@/components/StarRating'
import type { ComicQueryParams } from '@/types'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  LayoutGrid,
  CheckSquare,
  Square,
  X,
  Tags,
  FolderTree,
  Star,
  BadgeCheck,
} from 'lucide-react'
import clsx from 'clsx'

interface ComicGridProps {
  useStore?: boolean
}

type BulkModalType = 'status' | 'rating' | 'categories' | 'tags' | null

const sortOptions: { value: ComicQueryParams['sort']; label: string }[] = [
  { value: 'title', label: '标题' },
  { value: 'createdAt', label: '添加时间' },
  { value: 'updatedAt', label: '更新时间' },
  { value: 'lastReadAt', label: '最近阅读' },
  { value: 'rating', label: '评分' },
]

const statusLabels: Record<string, string> = { ongoing: '连载中', completed: '已完结', unknown: '未知' }
const readingStatusLabels: Record<string, string> = { unread: '未读', reading: '在读', read: '已读', dropped: '弃读' }

export function ComicGrid({ useStore = true }: ComicGridProps) {
  const store = useComicStore()
  const comics = store.comics
  const pagination = store.pagination
  const filters = store.filters
  const loading = store.loading
  const { setFilters, fetchComics } = store
  const { categories, tags, fetchCategories, fetchTags } = useCategoryStore()

  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [bulkModal, setBulkModal] = useState<BulkModalType>(null)
  const [bulkForm, setBulkForm] = useState<{ categoryIds: number[]; tagIds: number[]; status?: string; score?: number; readingStatus?: string }>({
    categoryIds: [],
    tagIds: [],
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (useStore && comics.length === 0) {
      fetchComics()
    }
  }, [])

  const handleSortChange = useCallback(
    (sort: ComicQueryParams['sort']) => {
      const newOrder =
        filters.sort === sort && filters.order === 'desc' ? 'asc' : 'desc'
      setFilters({ sort, order: newOrder })
    },
    [filters, setFilters]
  )

  const handlePageChange = useCallback(
    (page: number) => {
      setFilters({ page })
    },
    [setFilters]
  )

  const toggleSelectionMode = () => {
    setSelectionMode((prev) => {
      const next = !prev
      if (!next) setSelectedIds(new Set())
      return next
    })
  }

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const clearSelection = () => setSelectedIds(new Set())

  const openBulkModal = (type: Exclude<BulkModalType, null>) => {
    if (type === 'categories' || type === 'tags') {
      if (type === 'categories') fetchCategories(true)
      else fetchTags()
    }
    setBulkForm({ categoryIds: [], tagIds: [] })
    setBulkModal(type)
  }

  const handleSaveBulk = async () => {
    if (selectedIds.size === 0 || !bulkModal) return
    setSaving(true)
    try {
      const payload: { categoryIds?: number[]; tagIds?: number[]; status?: string; score?: number; readingStatus?: string } = {}
      if (bulkModal === 'categories' && bulkForm.categoryIds.length > 0) payload.categoryIds = bulkForm.categoryIds
      if (bulkModal === 'tags' && bulkForm.tagIds.length > 0) payload.tagIds = bulkForm.tagIds
      if (bulkModal === 'status' && bulkForm.status) payload.status = bulkForm.status
      if (bulkModal === 'rating') {
        if (bulkForm.score !== undefined) payload.score = bulkForm.score
        if (bulkForm.readingStatus) payload.readingStatus = bulkForm.readingStatus
      }
      await comicsApi.batchUpdate([...selectedIds], payload)
      setBulkModal(null)
      setSelectionMode(false)
      setSelectedIds(new Set())
      fetchComics()
    } catch {
      alert('批量操作失败')
    } finally {
      setSaving(false)
    }
  }

  const renderBulkModal = () => {
    if (!bulkModal) return null
    const title = bulkModal === 'status' ? '批量设置状态' : bulkModal === 'rating' ? '批量评分' : bulkModal === 'categories' ? '批量设置分类' : '批量设置标签'

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'var(--overlay)' }} onClick={(e) => { if (!saving && e.target === e.currentTarget) setBulkModal(null) }}>
        <div className="w-full max-w-md rounded-xl border p-6 shadow-2xl" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-base)' }} onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
            <button onClick={() => setBulkModal(null)} disabled={saving} className="rounded p-1" style={{ color: 'var(--text-secondary)' }}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="mb-3 text-xs" style={{ color: 'var(--text-muted)' }}>将应用到已选 {selectedIds.size} 部漫画</p>

          {bulkModal === 'status' && (
            <div className="flex gap-2">
              {(['ongoing', 'completed', 'unknown'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setBulkForm({ ...bulkForm, status: s })}
                  className="flex-1 rounded-lg border px-3 py-2 text-sm transition-colors"
                  style={{
                    borderColor: bulkForm.status === s ? 'var(--primary)' : 'var(--border-light)',
                    backgroundColor: bulkForm.status === s ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent',
                    color: bulkForm.status === s ? 'var(--primary)' : 'var(--text-secondary)',
                  }}
                >
                  {statusLabels[s]}
                </button>
              ))}
            </div>
          )}

          {bulkModal === 'rating' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Star className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                <StarRating
                  score={bulkForm.score ?? 0}
                  size="lg"
                  interactive
                  onRate={(s) => setBulkForm({ ...bulkForm, score: s })}
                />
                {bulkForm.score !== undefined && <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{bulkForm.score}/5</span>}
              </div>
              <div>
                <h4 className="mb-2 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>阅读状态</h4>
                <div className="flex gap-2">
                  {Object.entries(readingStatusLabels).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setBulkForm({ ...bulkForm, readingStatus: bulkForm.readingStatus === key ? undefined : key })}
                      className="rounded-full border px-3 py-1 text-xs transition-colors"
                      style={{
                        borderColor: bulkForm.readingStatus === key ? 'var(--primary)' : 'var(--border-light)',
                        color: bulkForm.readingStatus === key ? 'var(--primary)' : 'var(--text-secondary)',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {bulkModal === 'categories' && (
            <div className="flex flex-wrap gap-2 rounded-lg border p-3 max-h-48 overflow-y-auto" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-surface)' }}>
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-1.5 text-sm cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                  <input
                    type="checkbox"
                    checked={bulkForm.categoryIds.includes(cat.id)}
                    onChange={(e) => {
                      if (e.target.checked) setBulkForm({ ...bulkForm, categoryIds: [...bulkForm.categoryIds, cat.id] })
                      else setBulkForm({ ...bulkForm, categoryIds: bulkForm.categoryIds.filter((id) => id !== cat.id) })
                    }}
                  />
                  {cat.name}
                </label>
              ))}
              {categories.length === 0 && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>暂无分类</span>}
            </div>
          )}

          {bulkModal === 'tags' && (
            <div className="flex flex-wrap gap-2 rounded-lg border p-3 max-h-48 overflow-y-auto" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-surface)' }}>
              {tags.map((tag) => (
                <label key={tag.id} className="flex items-center gap-1.5 text-sm cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                  <input
                    type="checkbox"
                    checked={bulkForm.tagIds.includes(tag.id)}
                    onChange={(e) => {
                      if (e.target.checked) setBulkForm({ ...bulkForm, tagIds: [...bulkForm.tagIds, tag.id] })
                      else setBulkForm({ ...bulkForm, tagIds: bulkForm.tagIds.filter((id) => id !== tag.id) })
                    }}
                  />
                  {tag.name}
                </label>
              ))}
              {tags.length === 0 && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>暂无标签</span>}
            </div>
          )}

          <div className="mt-5 flex justify-end gap-3">
            <button
              onClick={() => setBulkModal(null)}
              disabled={saving}
              className="rounded-lg border px-4 py-2 text-sm"
              style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
            >
              取消
            </button>
            <button
              onClick={handleSaveBulk}
              disabled={saving}
              className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-hover disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            共 {pagination.total} 部漫画
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!selectionMode && sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSortChange(opt.value)}
              className={clsx(
                'flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                filters.sort === opt.value
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              {opt.label}
              {filters.sort === opt.value && (
                <ArrowUpDown
                  className={clsx('h-3 w-3', filters.order === 'asc' && 'rotate-180')}
                />
              )}
            </button>
          ))}
          <button
            onClick={toggleSelectionMode}
            className={clsx(
              'flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
              selectionMode ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            )}
          >
            {selectionMode ? <CheckSquare className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
            {selectionMode ? '完成' : '选择'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[2/3] rounded-lg bg-gray-800" />
              <div className="mt-2 h-4 w-3/4 rounded bg-gray-800" />
              <div className="mt-1 h-3 w-1/2 rounded bg-gray-800" />
            </div>
          ))}
        </div>
      ) : comics.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <LayoutGrid className="mb-4 h-16 w-16" />
          <p className="text-lg">暂无漫画</p>
          <p className="mt-1 text-sm">尝试扫描漫画库或调整筛选条件</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {comics.map((comic) => (
            <ComicCard
              key={comic.id}
              comic={comic}
              selectionMode={selectionMode}
              selected={selectedIds.has(comic.id)}
              onToggleSelect={() => toggleSelect(comic.id)}
            />
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="rounded-lg border border-gray-700 p-2 text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-30"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(pagination.totalPages, 7) }).map((_, i) => {
              let pageNum: number
              if (pagination.totalPages <= 7) {
                pageNum = i + 1
              } else if (pagination.page <= 4) {
                pageNum = i + 1
              } else if (pagination.page >= pagination.totalPages - 3) {
                pageNum = pagination.totalPages - 6 + i
              } else {
                pageNum = pagination.page - 3 + i
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={clsx(
                    'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                    pagination.page === pageNum
                      ? 'bg-primary text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  )}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="rounded-lg border border-gray-700 p-2 text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-30"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {selectionMode && selectedIds.size > 0 && (
        <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl border px-4 py-2.5 shadow-xl" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-surface)' }}>
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>已选 {selectedIds.size} 部</span>
          <span className="mx-1 h-4 w-px" style={{ backgroundColor: 'var(--border-light)' }} />
          <button onClick={() => openBulkModal('status')} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs transition-colors" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '' }}>
            <BadgeCheck className="h-3.5 w-3.5" />状态
          </button>
          <button onClick={() => openBulkModal('rating')} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs transition-colors" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '' }}>
            <Star className="h-3.5 w-3.5" />评分
          </button>
          <button onClick={() => openBulkModal('categories')} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs transition-colors" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '' }}>
            <FolderTree className="h-3.5 w-3.5" />分类
          </button>
          <button onClick={() => openBulkModal('tags')} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs transition-colors" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '' }}>
            <Tags className="h-3.5 w-3.5" />标签
          </button>
          <button onClick={clearSelection} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs transition-colors" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '' }}>
            <X className="h-3.5 w-3.5" />清除
          </button>
        </div>
      )}

      {renderBulkModal()}
    </div>
  )
}
