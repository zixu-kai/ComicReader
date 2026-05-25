import { sqliteTable, text, integer, real, index, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const comics = sqliteTable('comics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  titleSort: text('title_sort').notNull(),
  author: text('author'),
  artist: text('artist'),
  description: text('description'),
  status: text('status', { enum: ['ongoing', 'completed', 'unknown'] }).notNull().default('unknown'),
  year: integer('year'),
  language: text('language'),
  path: text('path').notNull().unique(),
  fileType: text('file_type', { enum: ['cbz', 'cbr', 'zip', 'rar', 'folder', 'pdf'] }).notNull(),
  pageCount: integer('page_count').notNull().default(0),
  coverPath: text('cover_path'),
  fileSize: integer('file_size').notNull().default(0),
  lastReadAt: text('last_read_at'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
}, (table) => [
  index('idx_comics_title').on(table.titleSort),
  index('idx_comics_author').on(table.author),
  index('idx_comics_status').on(table.status),
  index('idx_comics_created').on(table.createdAt),
])

export const chapters = sqliteTable('chapters', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  comicId: integer('comic_id').notNull().references(() => comics.id, { onDelete: 'cascade' }),
  volume: integer('volume'),
  chapterNumber: integer('chapter_number').notNull().default(1),
  title: text('title'),
  pageCount: integer('page_count').notNull().default(0),
  filePath: text('file_path').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
}, (table) => [
  index('idx_chapters_comic').on(table.comicId),
  index('idx_chapters_sort').on(table.comicId, table.sortOrder),
])

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  description: text('description'),
  order: integer('order').notNull().default(0),
  parentId: integer('parent_id').references((): any => categories.id, { onDelete: 'set null' }),
  hidden: integer('hidden', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
}, (table) => [
  index('idx_categories_parent').on(table.parentId),
])

export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const comicCategories = sqliteTable('comic_categories', {
  comicId: integer('comic_id').notNull().references(() => comics.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
}, (table) => [
  index('idx_comic_categories_comic').on(table.comicId),
  index('idx_comic_categories_category').on(table.categoryId),
])

export const comicTags = sqliteTable('comic_tags', {
  comicId: integer('comic_id').notNull().references(() => comics.id, { onDelete: 'cascade' }),
  tagId: integer('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (table) => [
  index('idx_comic_tags_comic').on(table.comicId),
  index('idx_comic_tags_tag').on(table.tagId),
])

export const ratings = sqliteTable('ratings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  comicId: integer('comic_id').notNull().references(() => comics.id, { onDelete: 'cascade' }).unique(),
  score: integer('score').notNull().default(0),
  readingStatus: text('reading_status', { enum: ['unread', 'reading', 'read', 'dropped'] }).notNull().default('unread'),
  notes: text('notes'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
}, (table) => [
  index('idx_ratings_comic').on(table.comicId),
  index('idx_ratings_status').on(table.readingStatus),
])

export const readingProgress = sqliteTable('reading_progress', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  comicId: integer('comic_id').notNull().references(() => comics.id, { onDelete: 'cascade' }),
  chapterId: integer('chapter_id').notNull().references(() => chapters.id, { onDelete: 'cascade' }),
  currentPage: integer('current_page').notNull().default(0),
  totalPages: integer('total_pages').notNull().default(0),
  isCompleted: integer('is_completed', { mode: 'boolean' }).notNull().default(false),
  lastReadAt: text('last_read_at').notNull().$defaultFn(() => new Date().toISOString()),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
}, (table) => [
  index('idx_progress_comic').on(table.comicId),
  index('idx_progress_last_read').on(table.lastReadAt),
])

export const bookmarks = sqliteTable('bookmarks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  order: integer('order').notNull().default(0),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const bookmarkComics = sqliteTable('bookmark_comics', {
  bookmarkId: integer('bookmark_id').notNull().references(() => bookmarks.id, { onDelete: 'cascade' }),
  comicId: integer('comic_id').notNull().references(() => comics.id, { onDelete: 'cascade' }),
}, (table) => [
  index('idx_bookmark_comics_bookmark').on(table.bookmarkId),
  uniqueIndex('idx_bookmark_comics_unique').on(table.bookmarkId, table.comicId),
])

export const bookmarkBooks = sqliteTable('bookmark_books', {
  bookmarkId: integer('bookmark_id').notNull().references(() => bookmarks.id, { onDelete: 'cascade' }),
  bookId: integer('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
}, (table) => [
  index('idx_bookmark_books_bookmark').on(table.bookmarkId),
  uniqueIndex('idx_bookmark_books_unique').on(table.bookmarkId, table.bookId),
])

export const books = sqliteTable('books', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  titleSort: text('title_sort').notNull(),
  author: text('author'),
  description: text('description'),
  publisher: text('publisher'),
  publishDate: text('publish_date'),
  isbn: text('isbn'),
  language: text('language'),
  pageCount: integer('page_count').notNull().default(0),
  format: text('format', { enum: ['epub', 'pdf', 'txt', 'mobi', 'azw3'] }).notNull(),
  path: text('path').notNull().unique(),
  coverPath: text('cover_path'),
  fileSize: integer('file_size').notNull().default(0),
  lastReadAt: text('last_read_at'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
}, (table) => [
  index('idx_books_title').on(table.titleSort),
  index('idx_books_author').on(table.author),
  index('idx_books_format').on(table.format),
  index('idx_books_created').on(table.createdAt),
])

export const bookTags = sqliteTable('book_tags', {
  bookId: integer('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
  tagId: integer('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (table) => [
  index('idx_book_tags_book').on(table.bookId),
  index('idx_book_tags_tag').on(table.tagId),
])

export const bookCategories = sqliteTable('book_categories', {
  bookId: integer('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
}, (table) => [
  index('idx_book_categories_book').on(table.bookId),
  index('idx_book_categories_category').on(table.categoryId),
])

export const bookRatings = sqliteTable('book_ratings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  bookId: integer('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }).unique(),
  score: integer('score').notNull().default(0),
  readingStatus: text('reading_status', { enum: ['unread', 'reading', 'read', 'dropped'] }).notNull().default('unread'),
  notes: text('notes'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
}, (table) => [
  index('idx_book_ratings_book').on(table.bookId),
  index('idx_book_ratings_status').on(table.readingStatus),
])

export const bookReadingProgress = sqliteTable('book_reading_progress', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  bookId: integer('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
  cfi: text('cfi'),
  percentage: real('percentage').notNull().default(0),
  currentPage: integer('current_page').notNull().default(0),
  totalPages: integer('total_pages').notNull().default(0),
  charOffset: integer('char_offset').notNull().default(0),
  isCompleted: integer('is_completed', { mode: 'boolean' }).notNull().default(false),
  lastReadAt: text('last_read_at').notNull().$defaultFn(() => new Date().toISOString()),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
}, (table) => [
  index('idx_book_progress_book').on(table.bookId),
  index('idx_book_progress_last_read').on(table.lastReadAt),
])

export const bookNotes = sqliteTable('book_notes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  bookId: integer('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
  cfi: text('cfi').notNull(),
  text: text('text').notNull(),
  note: text('note'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
}, (table) => [
  index('idx_book_notes_book').on(table.bookId),
])

export const bookBookmarks = sqliteTable('book_bookmarks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  bookId: integer('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
  cfi: text('cfi').notNull(),
  title: text('title'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
}, (table) => [
  index('idx_book_bookmarks_book').on(table.bookId),
])

export const bookChapters = sqliteTable('book_chapters', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  bookId: integer('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  startPos: integer('start_pos').notNull(),
  endPos: integer('end_pos').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
}, (table) => [
  index('idx_book_chapters_book').on(table.bookId),
])

export const annotations = sqliteTable('annotations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  targetType: text('target_type', { enum: ['comic', 'book'] }).notNull(),
  targetId: integer('target_id').notNull(),
  page: integer('page'),
  position: text('position'),
  content: text('content').notNull(),
  note: text('note'),
  color: text('color').default('yellow'),
  startOffset: integer('start_offset'),
  endOffset: integer('end_offset'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
}, (table) => [
  index('idx_annotations_target').on(table.targetType, table.targetId),
])
