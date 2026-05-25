import { useEffect } from 'react'
import { useBookStore } from '@/stores/bookStore'
import { BookCard } from '@/components/BookCard'
import { ArrowLeft, ArrowRight, ArrowUpDown } from 'lucide-react'

export function BookGrid() {
  const { books, total, page, pageSize, loading, filters, fetchBooks, setPage, setFilters } = useBookStore()
  const totalPages = Math.ceil(total / pageSize)

  useEffect(() => {
    fetchBooks()
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">
          共 {total} 本图书
        </span>
        <div className="flex items-center gap-2">
          <select
            value={filters.sort || 'title'}
            onChange={(e) => setFilters({ sort: e.target.value as 'title' | 'createdAt' | 'updatedAt' | 'lastReadAt', page: 1 })}
            className="rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-white outline-none"
          >
            <option value="title">按标题</option>
            <option value="createdAt">按添加时间</option>
            <option value="updatedAt">按更新时间</option>
            <option value="lastReadAt">按最近阅读</option>
          </select>
          <button
            onClick={() => setFilters({ order: filters.order === 'asc' ? 'desc' : 'asc' })}
            className="rounded border border-gray-700 p-1 text-gray-400 hover:text-white"
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-8 w-8 rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : books.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <p className="text-lg">暂无图书</p>
          <p className="text-sm">点击"扫描库"添加图书</p>
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            className="rounded border border-gray-700 p-2 text-gray-400 hover:text-white disabled:opacity-30"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-gray-400">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
            className="rounded border border-gray-700 p-2 text-gray-400 hover:text-white disabled:opacity-30"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
