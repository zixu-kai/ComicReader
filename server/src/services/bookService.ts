import { eq, like, desc, asc, sql, and, SQL } from 'drizzle-orm'
import fs from 'fs'
import { db, schema } from '@/db/index.js'
import type { Book, PaginatedResponse, BookQueryParams, BookScanResult } from '@/types/index.js'
import { bookScanService } from './bookScanService.js'

const { books, bookTags, bookCategories, tags, categories, bookRatings, bookReadingProgress } = schema

export const bookService = {
  async listBooks(query: BookQueryParams): Promise<PaginatedResponse<Book>> {
    const {
      page = 1,
      pageSize = 20,
      sort = 'title',
      order = 'asc',
      tagId,
      format,
      readingStatus,
      query: searchQuery,
      author,
    } = query

    const conditions: SQL[] = []

    if (format) {
      conditions.push(eq(books.format, format))
    }
    if (searchQuery) {
      conditions.push(
        sql`(${books.title} LIKE ${`%${searchQuery}%`} OR ${books.author} LIKE ${`%${searchQuery}%`} OR ${books.publisher} LIKE ${`%${searchQuery}%`})`
      )
    }
    if (author) {
      conditions.push(like(books.author, `%${author}%`))
    }
    if (tagId) {
      const bookIdsSubquery = db
        .select({ id: bookTags.bookId })
        .from(bookTags)
        .where(eq(bookTags.tagId, tagId))
      conditions.push(sql`${books.id} IN ${bookIdsSubquery}`)
    }

    const hiddenCategoryIds = db
      .select({ id: categories.id })
      .from(categories)
      .where(sql`${categories.hidden} IS TRUE`)
    const hiddenBookIds = db
      .select({ id: bookCategories.bookId })
      .from(bookCategories)
      .where(sql`${bookCategories.categoryId} IN ${hiddenCategoryIds}`)
    conditions.push(sql`${books.id} NOT IN ${hiddenBookIds}`)
    if (readingStatus) {
      const bookIdsSubquery = db
        .select({ id: bookRatings.bookId })
        .from(bookRatings)
        .where(eq(bookRatings.readingStatus, readingStatus))
      conditions.push(sql`${books.id} IN ${bookIdsSubquery}`)
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const sortColumn = (() => {
      switch (sort) {
        case 'title': return books.titleSort
        case 'createdAt': return books.createdAt
        case 'updatedAt': return books.updatedAt
        case 'lastReadAt': return books.lastReadAt
        default: return books.titleSort
      }
    })()
    const orderFn = order === 'desc' ? desc : asc

    const offset = (page - 1) * pageSize

    const [countResult, rows] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(books).where(whereClause),
      db.select().from(books).where(whereClause).orderBy(orderFn(sortColumn)).limit(pageSize).offset(offset),
    ])

    const total = countResult[0].count
    const totalPages = Math.ceil(total / pageSize)

    return {
      data: rows as Book[],
      total,
      page,
      pageSize,
      totalPages,
    }
  },

  async getBook(id: number): Promise<Book | null> {
    const [book] = await db.select().from(books).where(eq(books.id, id))
    if (!book) return null

    const bookTagsRows = await db
      .select({ id: tags.id, name: tags.name, createdAt: tags.createdAt })
      .from(bookTags)
      .innerJoin(tags, eq(bookTags.tagId, tags.id))
      .where(eq(bookTags.bookId, id))

    const bookCategoriesRows = await db
      .select({ id: categories.id, name: categories.name, description: categories.description, order: categories.order, parentId: categories.parentId, createdAt: categories.createdAt })
      .from(bookCategories)
      .innerJoin(categories, eq(bookCategories.categoryId, categories.id))
      .where(eq(bookCategories.bookId, id))

    const [rating] = await db.select().from(bookRatings).where(eq(bookRatings.bookId, id))
    const [progress] = await db.select().from(bookReadingProgress).where(eq(bookReadingProgress.bookId, id))

    return {
      ...book,
      tags: bookTagsRows,
      categories: bookCategoriesRows,
      rating: rating || null,
      readingProgress: progress || null,
    } as Book
  },

  async updateBook(id: number, data: Partial<Book>): Promise<Book | null> {
    const updateData: Record<string, unknown> = { ...data, updatedAt: new Date().toISOString() }
    const tagIds = data.tagIds as number[] | undefined
    const categoryIds = data.categoryIds as number[] | undefined
    delete updateData.id
    delete updateData.tags
    delete updateData.tagIds
    delete updateData.categories
    delete updateData.categoryIds
    delete updateData.rating
    delete updateData.readingProgress
    delete updateData.createdAt
    for (const key of Object.keys(updateData)) {
      if (updateData[key] === undefined) delete updateData[key]
    }

    if (Object.keys(updateData).length > 0) {
      await db.update(books).set(updateData).where(eq(books.id, id))
    }

    if (categoryIds) {
      await db.delete(bookCategories).where(eq(bookCategories.bookId, id))
      if (categoryIds.length > 0) {
        await db.insert(bookCategories).values(categoryIds.map(categoryId => ({ bookId: id, categoryId })))
      }
    }

    if (tagIds) {
      await db.delete(bookTags).where(eq(bookTags.bookId, id))
      if (tagIds.length > 0) {
        await db.insert(bookTags).values(tagIds.map(tagId => ({ bookId: id, tagId })))
      }
    }

    return this.getBook(id)
  },

  async deleteBook(id: number): Promise<void> {
    const [book] = await db.select().from(books).where(eq(books.id, id))
    if (book) {
      if (book.coverPath && fs.existsSync(book.coverPath)) {
        fs.unlinkSync(book.coverPath)
      }
      if (book.path && fs.existsSync(book.path)) {
        fs.unlinkSync(book.path)
      }
    }
    await db.delete(books).where(eq(books.id, id))
  },

  async scanBooks(namingMode?: string): Promise<BookScanResult> {
    return bookScanService.scanBooks(namingMode)
  },

  async getRandomBooks(count: number): Promise<Book[]> {
    const result = await db.select().from(books).orderBy(sql`RANDOM()`).limit(count)
    return result as Book[]
  },

  async searchBooks(query: string): Promise<Book[]> {
    const searchTerm = `%${query}%`
    return db.select().from(books).where(
      sql`(${books.title} LIKE ${searchTerm} OR ${books.author} LIKE ${searchTerm} OR ${books.publisher} LIKE ${searchTerm} OR ${books.description} LIKE ${searchTerm})`
    ).limit(50) as Promise<Book[]>
  },
}
