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
  bookCount?: number
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
  books?: number[]
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

export type BookFormat = 'epub' | 'pdf' | 'txt' | 'mobi' | 'azw3'

export interface Book {
  id: number
  title: string
  titleSort: string
  author: string | null
  description: string | null
  format: BookFormat
  publisher: string | null
  publishDate: string | null
  language: string | null
  isbn: string | null
  path: string
  coverPath: string | null
  fileSize: number
  pageCount: number | null
  lastReadAt: string | null
  createdAt: string
  updatedAt: string
  tags?: Tag[]
  categories?: Category[]
  tagIds?: number[]
  categoryIds?: number[]
  rating?: BookRating | null
  readingProgress?: BookReadingProgress | null
}

export interface BookRating {
  id: number
  bookId: number
  score: number
  readingStatus: ReadingStatus
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface BookReadingProgress {
  id: number
  bookId: number
  cfi: string | null
  percentage: number
  currentPage: number | null
  totalPages: number | null
  charOffset: number
  isCompleted: boolean
  lastReadAt: string
  createdAt: string
  updatedAt: string
}

export interface BookNote {
  id: number
  bookId: number
  cfi: string
  text: string
  note: string | null
  createdAt: string
  updatedAt: string
}

export interface BookBookmark {
  id: number
  bookId: number
  cfi: string
  title: string | null
  createdAt: string
}

export interface BookQueryParams {
  page?: number
  pageSize?: number
  sort?: 'title' | 'createdAt' | 'updatedAt' | 'lastReadAt'
  order?: 'asc' | 'desc'
  tagId?: number
  format?: BookFormat
  readingStatus?: ReadingStatus
  query?: string
  author?: string
}

export interface BookScanResult {
  added: number
  updated: number
  removed: number
  errors: string[]
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
