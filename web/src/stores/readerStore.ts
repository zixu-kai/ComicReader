import { create } from 'zustand'
import { progressApi } from '@/services/api'
import type { ReadingMode, ReadingDirection } from '@/types'

interface ReaderState {
  comicId: number | null
  chapterId: number | null
  currentPage: number
  totalPages: number
  readingMode: ReadingMode
  readingDirection: ReadingDirection
  zoom: number
  isFullscreen: boolean
  showControls: boolean
  loading: boolean

  openChapter: (comicId: number, chapterId: number, totalPages: number, startPage?: number) => void
  setReadingMode: (mode: ReadingMode) => void
  setReadingDirection: (direction: ReadingDirection) => void
  setZoom: (zoom: number) => void
  nextPage: () => void
  prevPage: () => void
  goToPage: (page: number) => void
  toggleFullscreen: () => void
  toggleControls: () => void
  setShowControls: (show: boolean) => void
  saveProgress: () => Promise<void>
  closeReader: () => void
}

export const useReaderStore = create<ReaderState>((set, get) => ({
  comicId: null,
  chapterId: null,
  currentPage: 1,
  totalPages: 0,
  readingMode: 'single',
  readingDirection: 'ltr',
  zoom: 100,
  isFullscreen: false,
  showControls: false,
  loading: false,

  openChapter: (comicId, chapterId, totalPages, startPage) => {
    set({
      comicId,
      chapterId,
      totalPages,
      currentPage: startPage ?? 1,
      loading: false,
    })
  },

  setReadingMode: (mode) => set({ readingMode: mode }),
  setReadingDirection: (direction) => set({ readingDirection: direction }),
  setZoom: (zoom) => set({ zoom: Math.max(50, Math.min(300, zoom)) }),

  nextPage: () => {
    const { currentPage, totalPages, readingMode, readingDirection } = get()
    const increment = readingMode === 'double' ? 2 : 1
    const dir = readingDirection === 'rtl' ? -increment : increment
    const newPage = currentPage + dir
    if (newPage >= 1 && newPage <= totalPages) {
      set({ currentPage: newPage })
      get().saveProgress()
    }
  },

  prevPage: () => {
    const { currentPage, totalPages, readingMode, readingDirection } = get()
    const increment = readingMode === 'double' ? 2 : 1
    const dir = readingDirection === 'rtl' ? increment : -increment
    const newPage = currentPage + dir
    if (newPage >= 1 && newPage <= totalPages) {
      set({ currentPage: newPage })
      get().saveProgress()
    }
  },

  goToPage: (page) => {
    const { totalPages } = get()
    if (page >= 1 && page <= totalPages) {
      set({ currentPage: page })
      get().saveProgress()
    }
  },

  toggleFullscreen: () => {
    set((state) => ({ isFullscreen: !state.isFullscreen }))
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  },

  toggleControls: () => set((state) => ({ showControls: !state.showControls })),
  setShowControls: (show) => set({ showControls: show }),

  saveProgress: async () => {
    const { comicId, chapterId, currentPage } = get()
    if (comicId && chapterId) {
      try {
        await progressApi.update(comicId, chapterId, currentPage)
      } catch {
        // silent fail for progress saving
      }
    }
  },

  closeReader: () => {
    get().saveProgress()
    set({
      comicId: null,
      chapterId: null,
      currentPage: 1,
      totalPages: 0,
      showControls: false,
      isFullscreen: false,
    })
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    }
  },
}))
