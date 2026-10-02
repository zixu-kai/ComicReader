import { FastifyInstance } from 'fastify'
import { db, schema } from '@/db/index.js'
import { eq, and } from 'drizzle-orm'

const { bookmarks, bookmarkComics } = schema

export async function bookmarkRoutes(app: FastifyInstance) {
  app.get('/api/bookmarks', async () => {
    const allBookmarks = await db.select().from(bookmarks).orderBy(bookmarks.order)
    const result = []
    for (const bm of allBookmarks) {
      const comics = await db.select({ comicId: bookmarkComics.comicId }).from(bookmarkComics).where(eq(bookmarkComics.bookmarkId, bm.id))
      result.push({ ...bm, comics: comics.map(c => c.comicId) })
    }
    if (result.length === 0) {
      const [created] = await db.insert(bookmarks).values({ name: '收藏', order: 0 }).returning()
      result.push({ ...created, comics: [] })
    }
    return result
  })

  app.post('/api/bookmarks/:id/comics', async (request) => {
    const { id } = request.params as { id: string }
    const { comicId } = request.body as { comicId: number }
    await db.insert(bookmarkComics).values({ bookmarkId: parseInt(id), comicId }).onConflictDoNothing()
    return { success: true }
  })

  app.delete('/api/bookmarks/:id/comics/:comicId', async (request) => {
    const { id, comicId } = request.params as { id: string; comicId: string }
    await db.delete(bookmarkComics).where(and(eq(bookmarkComics.bookmarkId, parseInt(id)), eq(bookmarkComics.comicId, parseInt(comicId))))
    return { success: true }
  })
}
