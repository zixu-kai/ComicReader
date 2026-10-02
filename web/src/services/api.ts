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
  Annotation,
} from '@/types'

const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
const BASE_URL = isTauri ? 'http://localhost:7788/api' : '/api'

function getAuthToken(): string | null {
  try {
    return localStorage.getItem('ownShelfToken')
  } catch {
    return null
  }
}

export function setAuthToken(token: string | null) {
  try {
    if (token) localStorage.setItem('ownShelfToken', token)
    else localStorage.removeItem('ownShelfToken')
  } catch {}
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const hasBody = options?.body !== undefined
  const headers: Record<string, string> = {
    ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
    ...options?.headers as Record<string, string>,
  }
  const token = getAuthToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  })

  if (response.status === 401 && !url.includes('/auth/')) {
    setAuthToken(null)
    window.dispatchEvent(new CustomEvent('ownShelfAuthRequired'))
  }

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

  scan: (namingMode?: string, scope?: string) => request<{ status: string; message?: string }>('/comics/scan', { method: 'POST', body: JSON.stringify({ namingMode: namingMode || 'folder', scope: scope || 'all' }) }),

  scanOptions: () => request<{ folders: string[] }>('/comics/scan/options'),

  scanStatus: () => request<{ status: string; result?: ScanResult }>('/comics/scan/status'),

  refresh: (id: number, namingMode?: string) => request<{ updated: boolean; added: number; removed: number }>(`/comics/${id}/refresh`, { method: 'POST', body: JSON.stringify({ namingMode: namingMode || 'folder' }) }),

  random: (count?: number) =>
    request<Comic[]>(`/comics/random${buildQuery({ count })}`),

  search: (query: string, params?: ComicQueryParams) =>
    request<PaginatedResponse<Comic>>(`/comics/search${buildQuery({ q: query, ...params as Record<string, unknown> })}`),

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

  batchUpdate: (ids: number[], data: { categoryIds?: number[]; tagIds?: number[]; status?: string; year?: number; language?: string; score?: number; readingStatus?: string }) =>
    request<{ success: boolean; count: number }>('/comics/batch', { method: 'PUT', body: JSON.stringify({ ids, ...data }) }),

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

  getThumbUrl: (chapterId: number, pageNum: number, width = 320) =>
    `${BASE_URL}/chapters/${chapterId}/pages/${pageNum}?w=${width}`,

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

  move: (id: number, direction: 'up' | 'down') =>
    request<{ success: boolean }>(`/tags/${id}/move`, { method: 'PUT', body: JSON.stringify({ direction }) }),

  batchDelete: (ids: number[]) =>
    request<{ success: boolean; count: number }>('/tags/batch-delete', { method: 'POST', body: JSON.stringify({ ids }) }),

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

  update: (comicId: number, chapterId: number, currentPage: number, totalPages?: number) =>
    request<ReadingProgress>(`/comics/${comicId}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ chapterId, currentPage, totalPages }),
    }),

  getContinueReading: (limit?: number) =>
    request<ReadingProgress[]>(`/progress/continue${buildQuery({ limit })}`),

  markCompleted: (comicId: number) =>
    request<void>(`/comics/${comicId}/complete`, { method: 'POST' }),
}

export const systemApi = {
  getInfo: () => request<ServerInfo>('/server/info'),

  getStats: () =>
    request<ServerInfo>('/server/stats'),

  exportBackup: () => {
    window.location.href = `${BASE_URL}/backup/export`
    return Promise.resolve()
  },

  importBackup: (data: Record<string, unknown[]>) =>
    request<{ success: boolean; message: string }>('/backup/import', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

export const bookmarksApi = {
  list: () => request<Bookmark[]>('/bookmarks'),

  addComic: (bookmarkId: number, comicId: number) =>
    request<void>(`/bookmarks/${bookmarkId}/comics`, { method: 'POST', body: JSON.stringify({ comicId }) }),

  removeComic: (bookmarkId: number, comicId: number) =>
    request<void>(`/bookmarks/${bookmarkId}/comics/${comicId}`, { method: 'DELETE' }),
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

export const authApi = {
  getStatus: () =>
    request<{ enabled: boolean }>('/auth/status'),

  login: (password: string) =>
    request<{ token: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ password }) }),
}
