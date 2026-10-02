export type ComicStatus = 'ongoing' | 'completed' | 'unknown'
export type ReadingStatus = 'unread' | 'reading' | 'read' | 'dropped'
export type FileType = 'cbz' | 'cbr' | 'zip' | 'rar' | 'folder' | 'pdf'
export type ReadingMode = 'single' | 'double' | 'scroll' | 'webtoon'
export type ReadingDirection = 'ltr' | 'rtl'

export interface Comic {
  id: number
  title: string
  titleSort: string
  author: string | null
  artist: string | null
  description: string | null
  status: ComicStatus
  year: number | null
  language: string | null
  path: string
  fileType: FileType
  pageCount: number
  coverPath: string | null
  fileSize: number
  lastReadAt: string | null
  createdAt: string
  updatedAt: string
  categories?: Category[]
  tags?: Tag[]
  categoryIds?: number[]
  tagIds?: number[]
  rating?: Rating | null
  readingProgress?: ReadingProgress | null
}

export interface Chapter {
  id: number
  comicId: number
  volume: number | null
  chapterNumber: number
  title: string | null
  pageCount: number
  filePath: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: number
  name: string
  description: string | null
  order: number
  parentId: number | null
  hidden?: boolean
  children?: Category[]
  comicCount?: number
  createdAt: string
}

export interface Tag {
  id: number
  name: string
  comicCount?: number
  createdAt: string
}

export interface Rating {
  id: number
  comicId: number
  score: number
  readingStatus: ReadingStatus
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface ReadingProgress {
  id: number
  comicId: number
  chapterId: number
  currentPage: number
  totalPages: number
  isCompleted: boolean
  lastReadAt: string
  createdAt: string
  updatedAt: string
}

export interface Bookmark {
  id: number
  name: string
  order: number
  comicCount?: number
  comics?: number[]
  createdAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ComicQueryParams {
  page?: number
  pageSize?: number
  sort?: 'title' | 'createdAt' | 'updatedAt' | 'lastReadAt' | 'rating'
  order?: 'asc' | 'desc'
  categoryId?: number
  tagId?: number
  status?: ComicStatus
  readingStatus?: ReadingStatus
  query?: string
  author?: string
}

export interface ServerInfo {
  version: string
  comicsCount: number
  categoriesCount: number
  tagsCount: number
  totalSize: number
  uptime: number
}

export interface ScanResult {
  added: number
  updated: number
  removed: number
  errors: string[]
}

export interface Annotation {
  id: number
  targetType: string
  targetId: number
  page: number
  content: string
  note: string | null
  startOffset: number | null
  endOffset: number | null
  createdAt: string
  updatedAt: string
}

export interface AppInfo {
  version: string
  productName: string
  identifier: string
  os: string
  arch: string
  dataDir: string
}
