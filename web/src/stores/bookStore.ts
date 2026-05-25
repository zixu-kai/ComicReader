import { create } from 'zustand'
import { booksApi } from '@/services/api'
import type { Book, BookQueryParams, BookScanResult } from '@/types'

interface BookState {
  books: Book[]
  currentBook: Book | null
  total: number
  page: number
  pageSize: number
  loading: boolean
  filters: BookQueryParams
  scanResult: BookScanResult | null

  fetchBooks: (filters?: BookQueryParams) => Promise<void>
  fetchBook: (id: number) => Promise<void>
  updateBook: (id: number, data: Partial<Book>) => Promise<void>
  deleteBook: (id: number) => Promise<void>
  scanBooks: () => Promise<void>
  fetchRandomBooks: (count?: number) => Promise<Book[]>
  searchBooks: (query: string) => Promise<Book[]>
  setFilters: (filters: Partial<BookQueryParams>) => void
  setPage: (page: number) => void
}

export const useBookStore = create<BookState>((set, get) => ({
  books: [],
  currentBook: null,
  total: 0,
  page: 1,
  pageSize: 20,
  loading: false,
  filters: { sort: 'title', order: 'asc' },
  scanResult: null,

  fetchBooks: async (filters?: BookQueryParams) => {
    set({ loading: true })
    try {
      const params = { ...get().filters, ...filters }
      const result = await booksApi.list(params)
      set({
        books: result.data,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        filters: params,
        loading: false,
      })
    } catch {
      set({ loading: false })
    }
  },

  fetchBook: async (id: number) => {
    set({ loading: true })
    try {
      const book = await booksApi.get(id)
      set({ currentBook: book, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  updateBook: async (id: number, data: Partial<Book>) => {
    const book = await booksApi.update(id, data)
    set({ currentBook: book })
  },

  deleteBook: async (id: number) => {
    await booksApi.delete(id)
    const { books } = get()
    set({ books: books.filter(b => b.id !== id) })
  },

  scanBooks: async () => {
    set({ loading: true })
    try {
      const result = await booksApi.scan()
      set({ scanResult: result, loading: false })
      await get().fetchBooks()
    } catch {
      set({ loading: false })
    }
  },

  fetchRandomBooks: async (count?: number) => {
    return booksApi.random(count)
  },

  searchBooks: async (query: string) => {
    return booksApi.search(query)
  },

  setFilters: (filters: Partial<BookQueryParams>) => {
    const newFilters = { ...get().filters, ...filters }
    set({ filters: newFilters })
    get().fetchBooks(newFilters)
  },

  setPage: (page: number) => {
    get().setFilters({ page })
  },
}))
