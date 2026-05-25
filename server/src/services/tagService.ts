import { eq, sql } from 'drizzle-orm'
import { db, schema } from '@/db/index.js'
import type { Tag } from '@/types/index.js'

const { tags, comicTags } = schema

export const tagService = {
  async getTags(): Promise<Tag[]> {
    const rows = await db.select().from(tags)

    const counts = await db
      .select({ tagId: comicTags.tagId, count: sql<number>`count(*)` })
      .from(comicTags)
      .groupBy(comicTags.tagId)

    const countMap = new Map(counts.map(c => [c.tagId, c.count]))

    return rows
      .filter(row => !/\[.*\]/.test(row.name))
      .map(row => ({
        ...row,
        comicCount: countMap.get(row.id) || 0,
      })) as Tag[]
  },

  async createTag(name: string): Promise<Tag> {
    const [result] = await db.insert(tags).values({ name }).returning()
    return result as Tag
  },

  async deleteTag(id: number): Promise<void> {
    await db.delete(tags).where(eq(tags.id, id))
  },
}
