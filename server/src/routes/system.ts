import { FastifyInstance } from 'fastify'
import { db, schema } from '@/db/index.js'
import { sql } from 'drizzle-orm'

import fs from 'fs'
import path from 'path'
import config from '@/config/index.js'

const { comics, categories, tags, ratings, readingProgress, chapters, comicCategories, comicTags, bookmarks, bookmarkComics } = schema

const startTime = Date.now()

export async function systemRoutes(app: FastifyInstance) {
  app.get('/api/server/info', async () => {
    const [comicCount] = await db.select({ count: sql<number>`count(*)` }).from(comics)
    const [categoryCount] = await db.select({ count: sql<number>`count(*)` }).from(categories)
    const [tagCount] = await db.select({ count: sql<number>`count(*)` }).from(tags)

    const [totalSize] = await db.select({ total: sql<number>`COALESCE(SUM(${comics.fileSize}), 0)` }).from(comics)

    return {
      version: '0.1.0',
      comicsCount: comicCount.count,
      categoriesCount: categoryCount.count,
      tagsCount: tagCount.count,
      totalSize: totalSize.total,
      uptime: Math.floor((Date.now() - startTime) / 1000),
    }
  })

  app.get('/api/server/stats', async () => {
    const [comicCount] = await db.select({ count: sql<number>`count(*)` }).from(comics)
    const [chapterCount] = await db.select({ count: sql<number>`count(*)` }).from(chapters)
    const [categoryCount] = await db.select({ count: sql<number>`count(*)` }).from(categories)
    const [tagCount] = await db.select({ count: sql<number>`count(*)` }).from(tags)
    const [readingCount] = await db.select({ count: sql<number>`count(*)` }).from(readingProgress).where(sql`${readingProgress.isCompleted} = 0`)
    const [completedCount] = await db.select({ count: sql<number>`count(*)` }).from(readingProgress).where(sql`${readingProgress.isCompleted} = 1`)
    const [totalSize] = await db.select({ total: sql<number>`COALESCE(SUM(${comics.fileSize}), 0)` }).from(comics)
    const [totalPages] = await db.select({ total: sql<number>`COALESCE(SUM(${comics.pageCount}), 0)` }).from(comics)

    return {
      comics: comicCount.count,
      chapters: chapterCount.count,
      categories: categoryCount.count,
      tags: tagCount.count,
      reading: readingCount.count,
      completed: completedCount.count,
      totalSize: totalSize.total,
      totalPages: totalPages.total,
    }
  })

  app.post('/api/backup/export', async (request, reply) => {
    const backupData: Record<string, unknown[]> = {}

    const tables = {
      comics,
      chapters,
      categories,
      tags,
      comicCategories,
      comicTags,
      ratings,
      readingProgress,
      bookmarks,
      bookmarkComics,
    } as const

    for (const [name, table] of Object.entries(tables)) {
      backupData[name] = await db.select().from(table)
    }

    reply.header('Content-Type', 'application/json')
    reply.header('Content-Disposition', `attachment; filename=comicreader-backup-${new Date().toISOString().slice(0, 10)}.json`)
    return backupData
  })

  app.post('/api/backup/import', async (request, reply) => {
    const data = request.body as Record<string, unknown[]>

    try {
      const tableOrder = ['categories', 'tags', 'comics', 'chapters', 'comicCategories', 'comicTags', 'ratings', 'readingProgress', 'bookmarks', 'bookmarkComics']

      for (const tableName of tableOrder) {
        if (data[tableName] && Array.isArray(data[tableName])) {
          const table = schema[tableName as keyof typeof schema]
          if (table && 'insert' in db) {
            for (const row of data[tableName]) {
              try {
                await db.insert(table as any).values(row as any).onConflictDoNothing()
              } catch {}
            }
          }
        }
      }

      return { success: true, message: 'Backup imported successfully' }
    } catch (err) {
      reply.code(500).send({ error: 'Import failed', message: err instanceof Error ? err.message : String(err) })
    }
  })
}
