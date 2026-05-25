import { eq, sql } from 'drizzle-orm'
import { db, schema } from '@/db/index.js'
import type { BookRating } from '@/types/index.js'

const { bookRatings } = schema

export const bookRatingService = {
  async getRating(bookId: number): Promise<BookRating | null> {
    const [rating] = await db.select().from(bookRatings).where(eq(bookRatings.bookId, bookId))
    return rating as BookRating | null
  },

  async setRating(bookId: number, score: number, readingStatus?: string, notes?: string): Promise<BookRating> {
    const [existing] = await db.select().from(bookRatings).where(eq(bookRatings.bookId, bookId))

    if (existing) {
      const updateData: Record<string, unknown> = { updatedAt: new Date().toISOString() }
      if (score !== undefined) updateData.score = score
      if (readingStatus) updateData.readingStatus = readingStatus
      if (notes !== undefined) updateData.notes = notes

      await db.update(bookRatings).set(updateData).where(eq(bookRatings.bookId, bookId))
    } else {
      await db.insert(bookRatings).values({
        bookId,
        score,
        readingStatus: (readingStatus as 'unread' | 'reading' | 'read' | 'dropped') || 'unread',
        notes: notes || null,
      })
    }

    const [rating] = await db.select().from(bookRatings).where(eq(bookRatings.bookId, bookId))
    return rating as BookRating
  },

  async getStats(): Promise<{ averageScore: number; totalRatings: number }> {
    const [result] = await db.select({
      averageScore: sql<number>`COALESCE(AVG(${bookRatings.score}), 0)`,
      totalRatings: sql<number>`COUNT(*)`,
    }).from(bookRatings)

    return {
      averageScore: Math.round(result.averageScore * 100) / 100,
      totalRatings: result.totalRatings,
    }
  },
}
