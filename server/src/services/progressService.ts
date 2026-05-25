import { eq, desc } from 'drizzle-orm'
import { db, schema } from '@/db/index.js'
import type { ReadingProgress, Comic } from '@/types/index.js'

const { readingProgress, comics, chapters } = schema

export const progressService = {
  async getProgress(comicId: number): Promise<ReadingProgress | null> {
    const [result] = await db.select().from(readingProgress).where(eq(readingProgress.comicId, comicId))
    return (result as ReadingProgress) || null
  },

  async updateProgress(comicId: number, chapterId: number, currentPage: number, totalPages: number): Promise<ReadingProgress> {
    const existing = await this.getProgress(comicId)
    const now = new Date().toISOString()

    if (existing) {
      await db.update(readingProgress).set({
        chapterId,
        currentPage,
        totalPages,
        isCompleted: currentPage >= totalPages,
        lastReadAt: now,
        updatedAt: now,
      }).where(eq(readingProgress.comicId, comicId))

      await db.update(comics).set({ lastReadAt: now, updatedAt: now }).where(eq(comics.id, comicId))
    } else {
      await db.insert(readingProgress).values({
        comicId,
        chapterId,
        currentPage,
        totalPages,
        isCompleted: currentPage >= totalPages,
        lastReadAt: now,
        createdAt: now,
        updatedAt: now,
      })

      await db.update(comics).set({ lastReadAt: now, updatedAt: now }).where(eq(comics.id, comicId))
    }

    const [result] = await db.select().from(readingProgress).where(eq(readingProgress.comicId, comicId))
    return result as ReadingProgress
  },

  async getContinueReading(): Promise<(ReadingProgress & { comic: Comic })[]> {
    const results = await db
      .select()
      .from(readingProgress)
      .innerJoin(comics, eq(readingProgress.comicId, comics.id))
      .where(eq(readingProgress.isCompleted, false))
      .orderBy(desc(readingProgress.lastReadAt))
      .limit(20)

    return results.map(r => ({
      ...r.reading_progress,
      comic: r.comics as Comic,
    })) as (ReadingProgress & { comic: Comic })[]
  },

  async markCompleted(comicId: number): Promise<void> {
    const now = new Date().toISOString()
    await db.update(readingProgress).set({
      isCompleted: true,
      lastReadAt: now,
      updatedAt: now,
    }).where(eq(readingProgress.comicId, comicId))
  },
}
