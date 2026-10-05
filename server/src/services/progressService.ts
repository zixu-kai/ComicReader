import { eq, desc, asc } from 'drizzle-orm'
import { db, schema } from '@/db/index.js'
import type { ReadingProgress, Comic } from '@/types/index.js'

const { readingProgress, comics, chapters } = schema

// 只有读完【最后一章】才标记为已完结；读到中间章节的最后一页不算完成，
// 否则"继续阅读"会被误判为已完成而失效
async function isLastChapter(comicId: number, chapterId: number): Promise<boolean> {
  const rows = await db.select({ id: chapters.id }).from(chapters)
    .where(eq(chapters.comicId, comicId))
    .orderBy(asc(chapters.sortOrder))
  if (rows.length === 0) return false
  return rows[rows.length - 1]!.id === chapterId
}

export const progressService = {
  async getProgress(comicId: number): Promise<ReadingProgress | null> {
    const [result] = await db.select().from(readingProgress).where(eq(readingProgress.comicId, comicId))
    return (result as ReadingProgress) || null
  },

  async updateProgress(comicId: number, chapterId: number, currentPage: number, totalPages: number): Promise<ReadingProgress> {
    const existing = await this.getProgress(comicId)
    const now = new Date().toISOString()
    const lastChapter = await isLastChapter(comicId, chapterId)
    const isCompleted = lastChapter && currentPage >= totalPages

    if (existing) {
      await db.update(readingProgress).set({
        chapterId,
        currentPage,
        totalPages,
        isCompleted,
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
        isCompleted,
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
