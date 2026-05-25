import type {
  Comic,
  Chapter,
  Category,
  Tag,
  Rating,
  ReadingProgress,
  Bookmark,
  PaginatedResponse,
  ComicQueryParams,
  ServerInfo,
  ScanResult,
  Book,
  BookRating,
  BookReadingProgress,
  BookNote,
  BookBookmark,
  BookQueryParams,
  BookScanResult,
  Annotation,
} from '@/types'

const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
const BASE_URL = isTauri ? 'http://localhost:7788/api' : '/api'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const hasBody = options?.body !== undefined
  const headers: Record<string, string> = {
    ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
    ...options?.headers as Record<string, string>,
  }
  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

function buildQuery(params?: Record<string, unknown>): string {
  if (!params) return ''
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value))
    }
  })
  const qs = searchParams.toString()
  return qs ? `?${qs}` : ''
}

export const comicsApi = {
  list: (params?: ComicQueryParams) =>
    request<PaginatedResponse<Comic>>(`/comics${buildQuery(params as Record<string, unknown>)}`),

  get: (id: number) => request<Comic>(`/comics/${id}`),

  update: (id: number, data: Partial<Comic> & { categoryIds?: number[]; tagIds?: number[] }) =>
    request<Comic>(`/comics/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: number) =>
    request<void>(`/comics/${id}`, { method: 'DELETE' }),

  scan: (namingMode?: string) => request<ScanResult>('/comics/scan', { method: 'POST', body: JSON.stringify({ namingMode: namingMode || 'folder' }) }),

  random: (count?: number) =>
    request<Comic[]>(`/comics/random${buildQuery({ count })}`),

  search: (query: string, params?: ComicQueryParams) =>
    request<PaginatedResponse<Comic>>(`/comics/search${buildQuery({ query, ...params as Record<string, unknown> })}`),

  getCoverUrl: (comicId: number, t?: string) => `${BASE_URL}/comics/${comicId}/cover${t ? `?t=${t}` : ''}`,

  uploadCover: async (comicId: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await fetch(`${BASE_URL}/comics/${comicId}/cover`, { method: 'POST', body: formData })
    if (!response.ok) throw new Error('Failed to upload cover')
    return response.json()
  },

  setCoverFromPage: (comicId: number, pageNum: number) =>
    request<{ success: boolean }>(`/comics/${comicId}/cover/page/${pageNum}`, { method: 'PUT' }),

  download: (comicId: number) => {
    window.location.href = `${BASE_URL}/comics/${comicId}/download`
  },
}

export const chaptersApi = {
  list: (comicId: number) =>
    request<Chapter[]>(`/comics/${comicId}/chapters`),

  getPages: (chapterId: number) =>
    request<{ pages: number }>(`/chapters/${chapterId}/pages`),

  getPageImageUrl: (chapterId: number, pageNum: number) =>
    `${BASE_URL}/chapters/${chapterId}/pages/${pageNum}`,

  backup: (chapterId: number) =>
    request<{ success: boolean }>(`/chapters/${chapterId}/backup`, { method: 'POST' }),

  commit: (chapterId: number) =>
    request<{ success: boolean }>(`/chapters/${chapterId}/commit`, { method: 'POST' }),

  revert: (chapterId: number) =>
    request<{ success: boolean }>(`/chapters/${chapterId}/revert`, { method: 'POST' }),

  reorderPages: async (chapterId: number, operations: { type: 'original' | 'new'; index?: number; fileKey?: string }[], newFiles: Map<string, File>) => {
    const formData = new FormData()
    formData.append('operations', JSON.stringify(operations))
    for (const [key, file] of newFiles) {
      formData.append(key, file)
    }
    const response = await fetch(`${BASE_URL}/chapters/${chapterId}/pages`, {
      method: 'PUT',
      body: formData,
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }
    return response.json() as Promise<{ success: boolean; pageCount: number }>
  },
}

export const categoriesApi = {
  list: (includeHidden = false) =>
    request<Category[]>(`/categories${includeHidden ? '?includeHidden=true' : ''}`),

  get: (id: number) => request<Category>(`/categories/${id}`),

  create: (data: Partial<Category>) =>
    request<Category>('/categories', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: number, data: Partial<Category>) =>
    request<Category>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  toggleHidden: (id: number) =>
    request<Category>(`/categories/${id}/toggle-hidden`, { method: 'PUT' }),

  delete: (id: number) =>
    request<void>(`/categories/${id}`, { method: 'DELETE' }),
}

export const tagsApi = {
  list: () =>
    request<Tag[]>('/tags'),

  create: (name: string) =>
    request<Tag>('/tags', { method: 'POST', body: JSON.stringify({ name }) }),

  delete: (id: number) =>
    request<void>(`/tags/${id}`, { method: 'DELETE' }),
}

export const ratingsApi = {
  get: (comicId: number) =>
    request<Rating | null>(`/comics/${comicId}/rating`),

  set: (comicId: number, score: number, readingStatus?: string, notes?: string) =>
    request<Rating>(`/comics/${comicId}/rating`, {
      method: 'PUT',
      body: JSON.stringify({ score, readingStatus, notes }),
    }),

  getStats: () =>
    request<{ averageScore: number; totalRatings: number }>('/ratings/stats'),
}

export const progressApi = {
  get: (comicId: number) =>
    request<ReadingProgress | null>(`/comics/${comicId}/progress`),

  update: (comicId: number, chapterId: number, currentPage: number) =>
    request<ReadingProgress>(`/comics/${comicId}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ chapterId, currentPage }),
    }),

  getContinueReading: (limit?: number) =>
    request<ReadingProgress[]>(`/progress/continue${buildQuery({ limit })}`),

  markCompleted: (comicId: number) =>
    request<void>(`/comics/${comicId}/progress/complete`, { method: 'PUT' }),
}

export const systemApi = {
  getInfo: () => request<ServerInfo>('/system/info'),

  getStats: () =>
    request<ServerInfo>('/system/stats'),

  exportBackup: () => {
    window.location.href = `${BASE_URL}/system/backup`
    return Promise.resolve()
  },

  importBackup: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return request<void>('/system/backup', {
      method: 'POST',
      headers: {},
      body: formData,
    })
  },
}

export const booksApi = {
  list: (params?: BookQueryParams) =>
    request<PaginatedResponse<Book>>(`/books${buildQuery(params as Record<string, unknown>)}`),

  get: (id: number) => request<Book>(`/books/${id}`),

  update: (id: number, data: Partial<Book> & { categoryIds?: number[]; tagIds?: number[] }) =>
    request<Book>(`/books/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: number) =>
    request<void>(`/books/${id}`, { method: 'DELETE' }),

  scan: (namingMode?: string) => request<BookScanResult>('/books/scan', { method: 'POST', body: JSON.stringify({ namingMode: namingMode || 'folder' }) }),

  random: (count?: number) =>
    request<Book[]>(`/books/random${buildQuery({ count })}`),

  search: (query: string) =>
    request<Book[]>(`/books/search${buildQuery({ q: query })}`),

  getFileUrl: (id: number) => `${BASE_URL}/books/${id}/file`,

  getTextRange: async (id: number, start: number, end: number): Promise<{ text: string; totalLength: number }> => {
    const response = await fetch(`${BASE_URL}/books/${id}/text-range?start=${start}&end=${end}`)
    if (!response.ok) throw new Error('Failed to fetch text range')
    return response.json()
  },

  saveText: (id: number, text: string) =>
    request<{ success: boolean }>(`/books/${id}/text`, { method: 'PUT', body: JSON.stringify({ text }) }),

  getChapters: (id: number) =>
    request<{ title: string; startPos: number }[]>(`/books/${id}/chapters`),

  updateChapters: (bookId: number, chapters: { title: string; startPos: number; endPos: number; index: number }[]) =>
    request<{ success: boolean }>(`/books/${bookId}/chapters`, { method: 'PUT', body: JSON.stringify({ chapters }) }),

  getCoverUrl: (id: number, t?: string) => `${BASE_URL}/books/${id}/cover${t ? `?t=${t}` : ''}`,

  uploadCover: async (bookId: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await fetch(`${BASE_URL}/books/${bookId}/cover`, { method: 'POST', body: formData })
    if (!response.ok) throw new Error('Failed to upload cover')
    return response.json()
  },

  download: (id: number) => {
    window.location.href = `${BASE_URL}/books/${id}/download`
  },

  exportEpub: (id: number) => {
    window.location.href = `${BASE_URL}/books/${id}/export-epub`
  },

  getProgress: (id: number) =>
    request<BookReadingProgress | null>(`/books/${id}/progress`),

  updateProgress: (id: number, data: { cfi?: string; percentage?: number; currentPage?: number; totalPages?: number; charOffset?: number; isCompleted?: boolean }) =>
    request<BookReadingProgress>(`/books/${id}/progress`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  markCompleted: (id: number) =>
    request<void>(`/books/${id}/progress/complete`, { method: 'PUT' }),

  getNotes: (id: number) =>
    request<BookNote[]>(`/books/${id}/notes`),

  createNote: (id: number, data: { cfi: string; text: string; note?: string }) =>
    request<BookNote>(`/books/${id}/notes`, { method: 'POST', body: JSON.stringify(data) }),

  deleteNote: (id: number, noteId: number) =>
    request<void>(`/books/${id}/notes/${noteId}`, { method: 'DELETE' }),

  getBookmarks: (id: number) =>
    request<BookBookmark[]>(`/books/${id}/bookmarks`),

  createBookmark: (id: number, data: { cfi: string; title?: string }) =>
    request<BookBookmark>(`/books/${id}/bookmarks`, { method: 'POST', body: JSON.stringify(data) }),

  deleteBookmark: (id: number, bookmarkId: number) =>
    request<void>(`/books/${id}/bookmarks/${bookmarkId}`, { method: 'DELETE' }),
}

export const bookmarksApi = {
  list: () => request<Bookmark[]>('/bookmarks'),

  addComic: (bookmarkId: number, comicId: number) =>
    request<void>(`/bookmarks/${bookmarkId}/comics`, { method: 'POST', body: JSON.stringify({ comicId }) }),

  removeComic: (bookmarkId: number, comicId: number) =>
    request<void>(`/bookmarks/${bookmarkId}/comics/${comicId}`, { method: 'DELETE' }),

  addBook: (bookmarkId: number, bookId: number) =>
    request<void>(`/bookmarks/${bookmarkId}/books`, { method: 'POST', body: JSON.stringify({ bookId }) }),

  removeBook: (bookmarkId: number, bookId: number) =>
    request<void>(`/bookmarks/${bookmarkId}/books/${bookId}`, { method: 'DELETE' }),
}

export const bookRatingsApi = {
  get: (bookId: number) =>
    request<BookRating | null>(`/books/${bookId}/rating`),

  set: (bookId: number, score: number, readingStatus?: string, notes?: string) =>
    request<BookRating>(`/books/${bookId}/rating`, {
      method: 'PUT',
      body: JSON.stringify({ score, readingStatus, notes }),
    }),

  getStats: () =>
    request<{ averageScore: number; totalRatings: number }>('/book-ratings/stats'),
}

export const annotationsApi = {
  list: (targetType: string, targetId: number) =>
    request<Annotation[]>(`/annotations/${targetType}/${targetId}`),
  create: (data: { targetType: string; targetId: number; page?: number; position?: string; content: string; note?: string; color?: string; startOffset?: number; endOffset?: number }) =>
    request<Annotation>('/annotations', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<{ page: number; position: string; content: string; note: string; color: string; startOffset: number; endOffset: number }>) =>
    request<Annotation>(`/annotations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<void>(`/annotations/${id}`, { method: 'DELETE' }),
}
