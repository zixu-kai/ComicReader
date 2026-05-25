import { eq, desc } from 'drizzle-orm'
import { db, schema } from '@/db/index.js'
import type { BookReadingProgress, BookNote, BookBookmark } from '@/types/index.js'

const { bookReadingProgress, bookRatings, bookNotes, bookBookmarks, books } = schema

export const bookProgressService = {
  async getProgress(bookId: number): Promise<BookReadingProgress | null> {
    const [progress] = await db.select().from(bookReadingProgress).where(eq(bookReadingProgress.bookId, bookId))
    return progress as BookReadingProgress | null
  },

  async updateProgress(bookId: number, data: { cfi?: string; percentage?: number; currentPage?: number; totalPages?: number; charOffset?: number; isCompleted?: boolean }): Promise<BookReadingProgress> {
    const [existing] = await db.select().from(bookReadingProgress).where(eq(bookReadingProgress.bookId, bookId))

    if (existing) {
      const updateData: Record<string, unknown> = {
        ...data,
        lastReadAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      await db.update(bookReadingProgress).set(updateData).where(eq(bookReadingProgress.bookId, bookId))
    } else {
      await db.insert(bookReadingProgress).values({
        bookId,
        cfi: data.cfi || null,
        percentage: data.percentage || 0,
        currentPage: data.currentPage || 0,
        totalPages: data.totalPages || 0,
        charOffset: data.charOffset || 0,
        isCompleted: data.isCompleted || false,
        lastReadAt: new Date().toISOString(),
      })
    }

    await db.update(books).set({ lastReadAt: new Date().toISOString() }).where(eq(books.id, bookId))

    const [progress] = await db.select().from(bookReadingProgress).where(eq(bookReadingProgress.bookId, bookId))
    return progress as BookReadingProgress
  },

  async getContinueReading(limit: number = 10): Promise<(BookReadingProgress & { book: typeof books.$inferSelect })[]> {
    const results = await db
      .select()
      .from(bookReadingProgress)
      .innerJoin(books, eq(bookReadingProgress.bookId, books.id))
      .where(eq(bookReadingProgress.isCompleted, false))
      .orderBy(desc(bookReadingProgress.lastReadAt))
      .limit(limit)

    return results.map(r => ({ ...r.book_reading_progress, book: r.books }))
  },

  async markCompleted(bookId: number): Promise<void> {
    await db.update(bookReadingProgress).set({
      isCompleted: true,
      percentage: 100,
      updatedAt: new Date().toISOString(),
    }).where(eq(bookReadingProgress.bookId, bookId))
  },

  async getNotes(bookId: number): Promise<BookNote[]> {
    return db.select().from(bookNotes).where(eq(bookNotes.bookId, bookId)).orderBy(desc(bookNotes.createdAt)) as Promise<BookNote[]>
  },

  async createNote(bookId: number, data: { cfi: string; text: string; note?: string }): Promise<BookNote> {
    const [created] = await db.insert(bookNotes).values({
      bookId,
      cfi: data.cfi,
      text: data.text,
      note: data.note || null,
    }).returning()
    return created as BookNote
  },

  async deleteNote(bookId: number, noteId: number): Promise<void> {
    await db.delete(bookNotes).where(eq(bookNotes.id, noteId))
  },

  async getBookmarks(bookId: number): Promise<BookBookmark[]> {
    return db.select().from(bookBookmarks).where(eq(bookBookmarks.bookId, bookId)).orderBy(desc(bookBookmarks.createdAt)) as Promise<BookBookmark[]>
  },

  async createBookmark(bookId: number, data: { cfi: string; title?: string }): Promise<BookBookmark> {
    const [created] = await db.insert(bookBookmarks).values({
      bookId,
      cfi: data.cfi,
      title: data.title || null,
    }).returning()
    return created as BookBookmark
  },

  async deleteBookmark(bookId: number, bookmarkId: number): Promise<void> {
    await db.delete(bookBookmarks).where(eq(bookBookmarks.id, bookmarkId))
  },
}
