import { eq, sql } from 'drizzle-orm'
import { db, schema } from '@/db/index.js'
import type { Rating, ReadingStatus } from '@/types/index.js'

const { ratings } = schema

export const ratingService = {
  async getRating(comicId: number): Promise<Rating | null> {
    const [result] = await db.select().from(ratings).where(eq(ratings.comicId, comicId))
    return (result as Rating) || null
  },

  async setRating(comicId: number, score: number, readingStatus?: ReadingStatus, notes?: string): Promise<Rating> {
    const existing = await this.getRating(comicId)
    const now = new Date().toISOString()

    if (existing) {
      const updateData: Record<string, unknown> = { updatedAt: now }
      if (score !== undefined) updateData.score = score
      if (readingStatus !== undefined) updateData.readingStatus = readingStatus
      if (notes !== undefined) updateData.notes = notes

      await db.update(ratings).set(updateData).where(eq(ratings.comicId, comicId))
    } else {
      await db.insert(ratings).values({
        comicId,
        score,
        readingStatus: readingStatus || 'unread',
        notes: notes || null,
        createdAt: now,
        updatedAt: now,
      })
    }

    const [result] = await db.select().from(ratings).where(eq(ratings.comicId, comicId))
    return result as Rating
  },

  async getRatingStats(): Promise<{ averageScore: number; distribution: Record<number, number> }> {
    const stats = await db
      .select({
        avg: sql<number>`COALESCE(AVG(${ratings.score}), 0)`,
        total: sql<number>`count(*)`,
      })
      .from(ratings)

    const distributionRows = await db
      .select({
        score: ratings.score,
        count: sql<number>`count(*)`,
      })
      .from(ratings)
      .groupBy(ratings.score)

    const distribution: Record<number, number> = {}
    for (const row of distributionRows) {
      distribution[row.score] = row.count
    }

    return {
      averageScore: Math.round((stats[0].avg) * 100) / 100,
      distribution,
    }
  },
}
