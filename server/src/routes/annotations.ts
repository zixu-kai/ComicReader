import { FastifyInstance } from 'fastify'
import { eq, and } from 'drizzle-orm'
import { db, schema } from '@/db/index.js'

const { annotations } = schema

export async function annotationRoutes(app: FastifyInstance) {
  app.get('/api/annotations/:targetType/:targetId', async (request) => {
    const { targetType, targetId } = request.params as { targetType: 'comic' | 'book'; targetId: string }
    return db.select().from(annotations).where(
      and(eq(annotations.targetType, targetType), eq(annotations.targetId, parseInt(targetId)))
    )
  })

  app.post('/api/annotations', async (request) => {
    const data = request.body as any
    const [inserted] = await db.insert(annotations).values({
      targetType: data.targetType,
      targetId: data.targetId,
      page: data.page,
      position: data.position,
      content: data.content,
      note: data.note,
      color: data.color,
      startOffset: data.startOffset,
      endOffset: data.endOffset,
    }).returning()
    return inserted
  })

  app.put('/api/annotations/:id', async (request) => {
    const { id } = request.params as { id: string }
    const data = request.body as any
    const [updated] = await db.update(annotations).set({
      ...(data.page !== undefined && { page: data.page }),
      ...(data.position !== undefined && { position: data.position }),
      ...(data.content !== undefined && { content: data.content }),
      ...(data.note !== undefined && { note: data.note }),
      ...(data.color !== undefined && { color: data.color }),
      ...(data.startOffset !== undefined && { startOffset: data.startOffset }),
      ...(data.endOffset !== undefined && { endOffset: data.endOffset }),
      updatedAt: new Date().toISOString(),
    }).where(eq(annotations.id, parseInt(id))).returning()
    return updated
  })

  app.delete('/api/annotations/:id', async (request) => {
    const { id } = request.params as { id: string }
    await db.delete(annotations).where(eq(annotations.id, parseInt(id)))
    return { success: true }
  })
}
