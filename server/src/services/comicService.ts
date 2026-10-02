import { eq, like, desc, asc, sql, and, SQL } from 'drizzle-orm'
import fs from 'fs'
import { db, schema } from '@/db/index.js'
import type { Comic, PaginatedResponse, ComicQueryParams, ScanResult } from '@/types/index.js'
import { scanService } from './scanService.js'

const { comics, comicCategories, comicTags, categories, tags, ratings, readingProgress } = schema

export const comicService = {
  async listComics(query: ComicQueryParams): Promise<PaginatedResponse<Comic>> {
    const {
      page = 1,
      pageSize = 20,
      sort = 'title',
      order = 'asc',
      categoryId,
      tagId,
      status,
      readingStatus,
      query: searchQuery,
      author,
    } = query

    const conditions: SQL[] = []

    if (status) {
      conditions.push(eq(comics.status, status))
    }
    if (searchQuery) {
      conditions.push(
        sql`(${comics.title} LIKE ${`%${searchQuery}%`} OR ${comics.author} LIKE ${`%${searchQuery}%`} OR ${comics.artist} LIKE ${`%${searchQuery}%`})`
      )
    }
    if (author) {
      conditions.push(like(comics.author, `%${author}%`))
    }

    if (categoryId) {
      const comicIdsSubquery = db
        .select({ id: comicCategories.comicId })
        .from(comicCategories)
        .where(eq(comicCategories.categoryId, categoryId))
      conditions.push(sql`${comics.id} IN ${comicIdsSubquery}`)
    }

    const hiddenCategoryIds = db
      .select({ id: categories.id })
      .from(categories)
      .where(sql`${categories.hidden} IS TRUE`)
    const hiddenComicIds = db
      .select({ id: comicCategories.comicId })
      .from(comicCategories)
      .where(sql`${comicCategories.categoryId} IN ${hiddenCategoryIds}`)
    conditions.push(sql`${comics.id} NOT IN ${hiddenComicIds}`)

    if (tagId) {
      const comicIdsSubquery = db
        .select({ id: comicTags.comicId })
        .from(comicTags)
        .where(eq(comicTags.tagId, tagId))
      conditions.push(sql`${comics.id} IN ${comicIdsSubquery}`)
    }

    if (readingStatus) {
      const comicIdsSubquery = db
        .select({ id: ratings.comicId })
        .from(ratings)
        .where(eq(ratings.readingStatus, readingStatus))
      conditions.push(sql`${comics.id} IN ${comicIdsSubquery}`)
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const sortColumn = (() => {
      switch (sort) {
        case 'title': return comics.titleSort
        case 'createdAt': return comics.createdAt
        case 'updatedAt': return comics.updatedAt
        case 'lastReadAt': return comics.lastReadAt
        case 'rating': return comics.id
        default: return comics.titleSort
      }
    })()
    const orderFn = order === 'desc' ? desc : asc

    const offset = (page - 1) * pageSize

    const [countResult, rows] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(comics).where(whereClause),
      db.select().from(comics).where(whereClause).orderBy(orderFn(sortColumn)).limit(pageSize).offset(offset),
    ])

    const total = countResult[0].count
    const totalPages = Math.ceil(total / pageSize)

    // 批量关联评分与阅读进度，供卡片展示
    const comicIds = rows.map(c => c.id)
    let ratingMap = new Map<number, typeof ratings.$inferSelect>()
    let progressMap = new Map<number, typeof readingProgress.$inferSelect>()
    if (comicIds.length > 0) {
      const [ratingRows, progressRows] = await Promise.all([
        db.select().from(ratings).where(sql`${ratings.comicId} IN (${sql.join(comicIds.map(id => sql`${id}`), sql`,` )})`),
        db.select().from(readingProgress).where(sql`${readingProgress.comicId} IN (${sql.join(comicIds.map(id => sql`${id}`), sql`,` )})`),
      ])
      ratingMap = new Map(ratingRows.map(r => [r.comicId, r]))
      progressMap = new Map(progressRows.map(p => [p.comicId, p]))
    }

    return {
      data: rows.map(c => ({ ...c, rating: ratingMap.get(c.id) || null, readingProgress: progressMap.get(c.id) || null })),
      total,
      page,
      pageSize,
      totalPages,
    }
  },

  async getComic(id: number): Promise<Comic | null> {
    const [comic] = await db.select().from(comics).where(eq(comics.id, id))
    if (!comic) return null

    const comicCategoriesRows = await db
      .select({ id: categories.id, name: categories.name, description: categories.description, order: categories.order, parentId: categories.parentId, createdAt: categories.createdAt })
      .from(comicCategories)
      .innerJoin(categories, eq(comicCategories.categoryId, categories.id))
      .where(eq(comicCategories.comicId, id))

    const comicTagsRows = await db
      .select({ id: tags.id, name: tags.name, createdAt: tags.createdAt })
      .from(comicTags)
      .innerJoin(tags, eq(comicTags.tagId, tags.id))
      .where(eq(comicTags.comicId, id))

    // 忽略 Manga 标签（由 ComicInfo.xml 自动生成，不展示）
    const visibleTags = comicTagsRows.filter(t => t.name.toLowerCase() !== 'manga')

    const [rating] = await db.select().from(ratings).where(eq(ratings.comicId, id))

    const [progress] = await db.select().from(readingProgress).where(eq(readingProgress.comicId, id))

    return {
      ...comic,
      categories: comicCategoriesRows,
      tags: visibleTags,
      rating: rating || null,
      readingProgress: progress || null,
    } as Comic
  },

  async updateComic(id: number, data: Partial<Comic>): Promise<Comic | null> {
    const updateData: Record<string, unknown> = { ...data, updatedAt: new Date().toISOString() }
    const categoryIds = data.categoryIds as number[] | undefined
    const tagIds = data.tagIds as number[] | undefined
    delete updateData.id
    delete updateData.categories
    delete updateData.tags
    delete updateData.categoryIds
    delete updateData.tagIds
    delete updateData.rating
    delete updateData.readingProgress
    delete updateData.createdAt
    for (const key of Object.keys(updateData)) {
      if (updateData[key] === undefined) delete updateData[key]
    }

    if (Object.keys(updateData).length > 0) {
      await db.update(comics).set(updateData).where(eq(comics.id, id))
    }

    if (categoryIds) {
      await db.delete(comicCategories).where(eq(comicCategories.comicId, id))
      if (categoryIds.length > 0) {
        await db.insert(comicCategories).values(categoryIds.map(categoryId => ({ comicId: id, categoryId })))
      }
    }

    if (tagIds) {
      await db.delete(comicTags).where(eq(comicTags.comicId, id))
      if (tagIds.length > 0) {
        await db.insert(comicTags).values(tagIds.map(tagId => ({ comicId: id, tagId })))
      }
    }

    return this.getComic(id)
  },

  async deleteComic(id: number): Promise<void> {
    const [comic] = await db.select().from(comics).where(eq(comics.id, id))
    if (comic) {
      if (comic.coverPath && fs.existsSync(comic.coverPath)) {
        fs.unlinkSync(comic.coverPath)
      }
      if (comic.path && fs.existsSync(comic.path)) {
        const stat = fs.statSync(comic.path)
        if (stat.isDirectory()) {
          fs.rmSync(comic.path, { recursive: true, force: true })
        } else {
          fs.unlinkSync(comic.path)
        }
      }
    }
    await db.delete(comics).where(eq(comics.id, id))
  },

  async batchUpdate(
    ids: number[],
    data: { categoryIds?: number[]; tagIds?: number[]; status?: string; year?: number; language?: string; score?: number; readingStatus?: string }
  ): Promise<number> {
    if (ids.length === 0) return 0

    const comicUpdate: Record<string, unknown> = {}
    if (data.status !== undefined) comicUpdate.status = data.status
    if (data.year !== undefined) comicUpdate.year = data.year
    if (data.language !== undefined) comicUpdate.language = data.language
    if (Object.keys(comicUpdate).length > 0) {
      comicUpdate.updatedAt = new Date().toISOString()
      await db.update(comics).set(comicUpdate).where(sql`${comics.id} IN (${sql.join(ids.map(id => sql`${id}`), sql`,` )})`)
    }

    if (data.categoryIds) {
      for (const id of ids) {
        await db.delete(comicCategories).where(eq(comicCategories.comicId, id))
        if (data.categoryIds.length > 0) {
          await db.insert(comicCategories).values(data.categoryIds.map(categoryId => ({ comicId: id, categoryId })))
        }
      }
    }

    if (data.tagIds) {
      for (const id of ids) {
        await db.delete(comicTags).where(eq(comicTags.comicId, id))
        if (data.tagIds.length > 0) {
          await db.insert(comicTags).values(data.tagIds.map(tagId => ({ comicId: id, tagId })))
        }
      }
    }

    if (data.score !== undefined || data.readingStatus !== undefined) {
      for (const id of ids) {
        const [ratingRow] = await db.select().from(ratings).where(eq(ratings.comicId, id))
        const score = data.score !== undefined ? data.score : (ratingRow?.score ?? 0)
        const readingStatus = data.readingStatus !== undefined ? data.readingStatus : (ratingRow?.readingStatus ?? 'unread')
        if (ratingRow) {
          await db.update(ratings).set({
            score,
            readingStatus: readingStatus as 'unread' | 'reading' | 'read' | 'dropped',
            updatedAt: new Date().toISOString(),
          }).where(eq(ratings.id, ratingRow.id))
        } else {
          await db.insert(ratings).values({
            comicId: id,
            score,
            readingStatus: readingStatus as 'unread' | 'reading' | 'read' | 'dropped',
          })
        }
      }
    }

    return ids.length
  },

  async scanLibrary(namingMode?: string, scope: string = 'all'): Promise<ScanResult> {
    return scanService.scanLibrary(namingMode, scope)
  },

  async getRandomComics(count: number, categoryId?: number): Promise<Comic[]> {
    let result: Comic[]
    if (categoryId) {
      const rows = await db
        .select()
        .from(comics)
        .innerJoin(comicCategories, eq(comics.id, comicCategories.comicId))
        .where(eq(comicCategories.categoryId, categoryId))
        .orderBy(sql`RANDOM()`)
        .limit(count)
      result = rows.map(r => r.comics as Comic)
    } else {
      result = await db.select().from(comics).orderBy(sql`RANDOM()`).limit(count) as Comic[]
    }

    // 关联评分与阅读进度，供卡片展示
    if (result.length > 0) {
      const comicIds = result.map(c => c.id)
      const [ratingRows, progressRows] = await Promise.all([
        db.select().from(ratings).where(sql`${ratings.comicId} IN (${sql.join(comicIds.map(id => sql`${id}`), sql`,` )})`),
        db.select().from(readingProgress).where(sql`${readingProgress.comicId} IN (${sql.join(comicIds.map(id => sql`${id}`), sql`,` )})`),
      ])
      const ratingMap = new Map(ratingRows.map(r => [r.comicId, r]))
      const progressMap = new Map(progressRows.map(p => [p.comicId, p]))
      return result.map(c => ({ ...c, rating: ratingMap.get(c.id) || null, readingProgress: progressMap.get(c.id) || null }))
    }

    return result
  },

  async searchComics(query: string): Promise<Comic[]> {
    const searchTerm = `%${query}%`
    return db.select().from(comics).where(
      sql`(${comics.title} LIKE ${searchTerm} OR ${comics.author} LIKE ${searchTerm} OR ${comics.artist} LIKE ${searchTerm} OR ${comics.description} LIKE ${searchTerm})`
    ).limit(50) as Promise<Comic[]>
  },
}
