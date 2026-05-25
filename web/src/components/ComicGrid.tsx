import { useEffect, useCallback } from 'react'
import { ComicCard } from '@/components/ComicCard'
import { useComicStore } from '@/stores/comicStore'
import type { ComicQueryParams } from '@/types'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  LayoutGrid,
} from 'lucide-react'
import clsx from 'clsx'

interface ComicGridProps {
  comics?: ReturnType<typeof useComicStore.getState>['comics']
  pagination?: ReturnType<typeof useComicStore.getState>['pagination']
  filters?: ComicQueryParams
  onFilterChange?: (filters: Partial<ComicQueryParams>) => void
  loading?: boolean
  useStore?: boolean
}

const sortOptions: { value: ComicQueryParams['sort']; label: string }[] = [
  { value: 'title', label: '标题' },
  { value: 'createdAt', label: '添加时间' },
  { value: 'updatedAt', label: '更新时间' },
  { value: 'lastReadAt', label: '最近阅读' },
  { value: 'rating', label: '评分' },
]

export function ComicGrid({ useStore = true }: ComicGridProps) {
  const store = useComicStore()
  const comics = store.comics
  const pagination = store.pagination
  const filters = store.filters
  const loading = store.loading
  const { setFilters, fetchComics } = store

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            共 {pagination.total} 部漫画
          </span>
        </div>

        <div className="flex items-center gap-2">
          {sortOptions.map((opt) => (
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
            <ComicCard key={comic.id} comic={comic} />
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
    </div>
  )
}
