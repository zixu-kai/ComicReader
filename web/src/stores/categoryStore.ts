import { create } from 'zustand'
import { categoriesApi, tagsApi } from '@/services/api'
import type { Category, Tag } from '@/types'

interface CategoryState {
  categories: Category[]
  tags: Tag[]
  loading: boolean
  error: string | null

  fetchCategories: (includeHidden?: boolean) => Promise<void>
  createCategory: (data: Partial<Category>) => Promise<void>
  updateCategory: (id: number, data: Partial<Category>) => Promise<void>
  deleteCategory: (id: number) => Promise<void>
  toggleCategoryHidden: (id: number) => Promise<void>
  fetchTags: () => Promise<void>
  createTag: (name: string) => Promise<void>
  deleteTag: (id: number) => Promise<void>
  clearError: () => void
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  tags: [],
  loading: false,
  error: null,

  fetchCategories: async (includeHidden = false) => {
    set({ loading: true, error: null })
    try {
      const categories = await categoriesApi.list(includeHidden)
      set({ categories, loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  createCategory: async (data) => {
    try {
      await categoriesApi.create(data)
      await get().fetchCategories(true)
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  updateCategory: async (id, data) => {
    try {
      await categoriesApi.update(id, data)
      await get().fetchCategories(true)
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  deleteCategory: async (id) => {
    try {
      await categoriesApi.delete(id)
      await get().fetchCategories(true)
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  toggleCategoryHidden: async (id) => {
    try {
      await categoriesApi.toggleHidden(id)
      await get().fetchCategories(true)
    } catch (e) {
      console.error('Toggle category hidden failed:', e)
      set({ error: (e as Error).message })
      await get().fetchCategories(true)
    }
  },

  fetchTags: async () => {
    set({ loading: true, error: null })
    try {
      const tags = await tagsApi.list()
      set({ tags, loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  createTag: async (name) => {
    try {
      await tagsApi.create(name)
      await get().fetchTags()
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  deleteTag: async (id) => {
    try {
      await tagsApi.delete(id)
      await get().fetchTags()
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  clearError: () => set({ error: null }),
}))
