export class Category {
  id: number = 0
  name: string = ''
  description: string | null = null
  order: number = 0
  parentId: number | null = null
  children: Category[] = []
  comicCount: number = 0
}

export class Tag {
  id: number = 0
  name: string = ''
  comicCount: number = 0
}

export class Comic {
  id: number = 0
  title: string = ''
  titleSort: string = ''
  author: string | null = null
  artist: string | null = null
  description: string | null = null
  status: string = 'unknown'
  year: number | null = null
  language: string | null = null
  path: string = ''
  fileType: string = ''
  pageCount: number = 0
  coverPath: string | null = null
  fileSize: number = 0
  lastReadAt: string | null = null
  createdAt: string = ''
  updatedAt: string = ''
  categories: Category[] = []
  tags: Tag[] = []
  rating: ComicRating | null = null
  readingProgress: ComicReadingProgress | null = null
}

export class Chapter {
  id: number = 0
  comicId: number = 0
  volume: number | null = null
  chapterNumber: number = 0
  title: string | null = null
  pageCount: number = 0
  filePath: string = ''
  sortOrder: number = 0
}

export class ComicRating {
  id: number = 0
  comicId: number = 0
  score: number = 0
  readingStatus: string = ''
  notes: string | null = null
}

export class ComicReadingProgress {
  id: number = 0
  comicId: number = 0
  chapterId: number = 0
  currentPage: number = 0
  totalPages: number = 0
  isCompleted: boolean = false
  lastReadAt: string = ''
}

export class Book {
  id: number = 0
  title: string = ''
  titleSort: string = ''
  author: string | null = null
  description: string | null = null
  format: string = ''
  publisher: string | null = null
  publishDate: string | null = null
  language: string | null = null
  isbn: string | null = null
  path: string = ''
  coverPath: string | null = null
  fileSize: number = 0
  pageCount: number | null = null
  lastReadAt: string | null = null
  createdAt: string = ''
  updatedAt: string = ''
  tags: Tag[] = []
  rating: BookRating | null = null
  readingProgress: BookReadingProgress | null = null
}

export class BookRating {
  id: number = 0
  bookId: number = 0
  score: number = 0
  readingStatus: string = ''
  notes: string | null = null
}

export class BookReadingProgress {
  id: number = 0
  bookId: number = 0
  cfi: string | null = null
  percentage: number = 0
  currentPage: number | null = null
  totalPages: number | null = null
  isCompleted: boolean = false
  lastReadAt: string = ''
}

export class PaginatedResponse<T> {
  data: T[] = []
  total: number = 0
  page: number = 1
  pageSize: number = 20
  totalPages: number = 1
}

export class ComicQueryParams {
  page?: number = 1
  pageSize?: number = 20
  sort?: string = ''
  order?: string = ''
  categoryId?: number = 0
  tagId?: number = 0
  status?: string = ''
  readingStatus?: string = ''
  query?: string = ''
  author?: string = ''
}

export class BookQueryParams {
  page?: number = 1
  pageSize?: number = 20
  sort?: string = ''
  order?: string = ''
  tagId?: number = 0
  format?: string = ''
  readingStatus?: string = ''
  query?: string = ''
  author?: string = ''
}

export class ScanResult {
  added: number = 0
  updated: number = 0
  removed: number = 0
  errors: string[] = []
}

export class ChapterPagesResult {
  pages: number = 0
}

export class ServerInfo {
  version: string = ''
  comicCount: number = 0
  categoryCount: number = 0
  tagCount: number = 0
  totalSize: number = 0
  uptime: number = 0
}

export class ServerStats {
  comicCount: number = 0
  chapterCount: number = 0
  categoryCount: number = 0
  tagCount: number = 0
  readingCount: number = 0
  completedCount: number = 0
  totalSize: number = 0
  totalPages: number = 0
  bookCount: number = 0
}

export class Annotation {
  id: number = 0
  targetType: string = ''
  targetId: number = 0
  page: number = 0
  position: string = ''
  content: string = ''
  note: string = ''
  color: string = ''
  createdAt: string = ''
}

export class BookmarkItem {
  id: number = 0
  name: string = ''
  comicIds: number[] = []
  bookIds: number[] = []
}

export class BookNote {
  id: number = 0
  bookId: number = 0
  cfi: string = ''
  text: string = ''
  note: string = ''
  createdAt: string = ''
}

export class BookBookmark {
  id: number = 0
  bookId: number = 0
  cfi: string = ''
  label: string = ''
  createdAt: string = ''
}

export class TabItem {
  icon: ResourceStr = ''
  label: string = ''
  index: number = 0
}

export class ProgressUpdateRequest {
  chapterId: number = 0
  currentPage: number = 0
  totalPages: number = 0
}

export class RatingRequest {
  score: number = 0
  readingStatus: string = ''
  notes: string = ''
}

export class CreateNoteRequest {
  cfi: string = ''
  text: string = ''
  note: string = ''
}

export class CreateBookmarkRequest {
  cfi: string = ''
  label: string = ''
}

export class CreateCategoryRequest {
  name: string = ''
  description: string = ''
  parentId: number = 0
}

export class CreateTagRequest {
  name: string = ''
}

export class AddToBookmarkRequest {
  comicId: number = 0
}

export class AddBookToBookmarkRequest {
  bookId: number = 0
}

export class SelectItem {
  key: number = 0
  label: string = ''
}

export class StringSelectItem {
  key: string = ''
  label: string = ''
}
