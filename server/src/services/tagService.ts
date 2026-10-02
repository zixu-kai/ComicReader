import { eq, asc, sql } from 'drizzle-orm'
import { db, schema } from '@/db/index.js'
import type { Tag } from '@/types/index.js'

const { tags, comicTags } = schema

// 自动忽略的标签（Manga 由 ComicInfo.xml 的 Manga 字段自动生成，用户一般不关心）
function isIgnoredTag(name: string): boolean {
  return name.toLowerCase() === 'manga'
}

export const tagService = {
  async getTags(): Promise<Tag[]> {
    const rows = await db.select().from(tags).orderBy(asc(tags.order), asc(tags.id))

    const counts = await db
      .select({ tagId: comicTags.tagId, count: sql<number>`count(*)` })
      .from(comicTags)
      .groupBy(comicTags.tagId)

    const countMap = new Map(counts.map(c => [c.tagId, c.count]))

    return rows
      .filter(row => !/\[.*\]/.test(row.name) && !isIgnoredTag(row.name))
      .map(row => ({
        ...row,
        comicCount: countMap.get(row.id) || 0,
      })) as Tag[]
  },

  async createTag(name: string): Promise<Tag> {
    const [maxOrder] = await db.select({ maxOrder: sql<number>`COALESCE(MAX(${tags.order}), 0)` }).from(tags)
    const [result] = await db.insert(tags).values({ name, order: (maxOrder.maxOrder || 0) + 1 }).returning()
    return result as Tag
  },

  async moveTag(id: number, direction: 'up' | 'down'): Promise<void> {
    const rows = await db.select().from(tags).orderBy(asc(tags.order), asc(tags.id))
    const index = rows.findIndex(r => r.id === id)
    if (index < 0) return
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= rows.length) return
    const current = rows[index]!
    const target = rows[targetIndex]!
    await db.update(tags).set({ order: target.order }).where(eq(tags.id, current.id))
    await db.update(tags).set({ order: current.order }).where(eq(tags.id, target.id))
  },

  async deleteTags(ids: number[]): Promise<number> {
    if (ids.length === 0) return 0
    await db.delete(comicTags).where(sql`${comicTags.tagId} IN (${sql.join(ids.map(id => sql`${id}`), sql`,` )})`)
    await db.delete(tags).where(sql`${tags.id} IN (${sql.join(ids.map(id => sql`${id}`), sql`,` )})`)
    return ids.length
  },

  async deleteTag(id: number): Promise<void> {
    await db.delete(tags).where(eq(tags.id, id))
  },
}
