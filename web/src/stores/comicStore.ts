import { create } from 'zustand'
import { comicsApi, chaptersApi } from '@/services/api'
import type { Comic, ComicQueryParams, Chapter, PaginatedResponse } from '@/types'

interface ComicState {
  comics: Comic[]
  currentComic: Comic | null
  chapters: Chapter[]
  pagination: { total: number; page: number; pageSize: number; totalPages: number }
  filters: ComicQueryParams
  loading: boolean
  error: string | null

  fetchComics: (params?: ComicQueryParams) => Promise<void>
  fetchComic: (id: number) => Promise<void>
  updateComic: (id: number, data: Partial<Comic>) => Promise<void>
  deleteComic: (id: number) => Promise<void>
  scanLibrary: () => Promise<void>
  fetchRandomComics: (count?: number) => Promise<Comic[]>
  searchComics: (query: string) => Promise<void>
  setFilters: (filters: Partial<ComicQueryParams>) => void
  clearError: () => void
}

export const useComicStore = create<ComicState>((set, get) => ({
  comics: [],
  currentComic: null,
  chapters: [],
  pagination: { total: 0, page: 1, pageSize: 24, totalPages: 0 },
  filters: { page: 1, pageSize: 24, sort: 'updatedAt', order: 'desc' },
  loading: false,
  error: null,

  fetchComics: async (params?: ComicQueryParams) => {
    set({ loading: true, error: null })
    try {
      const queryParams = { ...get().filters, ...params }
      const result: PaginatedResponse<Comic> = await comicsApi.list(queryParams)
      set({
        comics: result.data,
        pagination: { total: result.total, page: result.page, pageSize: result.pageSize, totalPages: result.totalPages },
        filters: queryParams,
        loading: false,
      })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  fetchComic: async (id: number) => {
    set({ loading: true, error: null })
    try {
      const comic = await comicsApi.get(id)
      const chs = await chaptersApi.list(id)
      set({ currentComic: comic, chapters: chs, loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  updateComic: async (id: number, data: Partial<Comic>) => {
    try {
      const updated = await comicsApi.update(id, data)
      set((state) => ({
        comics: state.comics.map((c) => (c.id === id ? updated : c)),
        currentComic: state.currentComic?.id === id ? updated : state.currentComic,
      }))
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  deleteComic: async (id: number) => {
    try {
      await comicsApi.delete(id)
      set((state) => ({
        comics: state.comics.filter((c) => c.id !== id),
        currentComic: state.currentComic?.id === id ? null : state.currentComic,
      }))
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  scanLibrary: async () => {
    set({ loading: true, error: null })
    try {
      await comicsApi.scan()
      await get().fetchComics()
      set({ loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  fetchRandomComics: async (count?: number) => {
    try {
      return await comicsApi.random(count)
    } catch (e) {
      set({ error: (e as Error).message })
      return []
    }
  },

  searchComics: async (query: string) => {
    set({ loading: true, error: null })
    try {
      const result = await comicsApi.search(query, { page: 1, pageSize: get().filters.pageSize })
      set({
        comics: result.data,
        pagination: { total: result.total, page: result.page, pageSize: result.pageSize, totalPages: result.totalPages },
        loading: false,
      })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  setFilters: (filters: Partial<ComicQueryParams>) => {
    const newFilters = { ...get().filters, ...filters, page: filters.page ?? 1 }
    set({ filters: newFilters })
    get().fetchComics(newFilters)
  },

  clearError: () => set({ error: null }),
}))
