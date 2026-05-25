import { FastifyInstance } from 'fastify'
import multipart from '@fastify/multipart'
import { chapterService } from '@/services/chapterService.js'
import path from 'path'

export async function chapterRoutes(app: FastifyInstance) {
  await app.register(multipart, { limits: { fileSize: 50 * 1024 * 1024 } })

  app.get('/api/comics/:comicId/chapters', async (request) => {
    const { comicId } = request.params as { comicId: string }
    return chapterService.getChapters(parseInt(comicId))
  })

  app.get('/api/chapters/:id/pages', async (request, reply) => {
    const { id } = request.params as { id: string }
    const pages = await chapterService.getChapterPages(parseInt(id))
    if (!pages || pages.length === 0) {
      reply.code(404).send({ error: 'Chapter not found' })
      return
    }
    return { pages: pages.length }
  })

  app.get('/api/chapters/:id/pages/:pageNum', async (request, reply) => {
    const { id, pageNum } = request.params as { id: string; pageNum: string }
    const imageBuffer = await chapterService.getPageImage(parseInt(id), parseInt(pageNum))

    if (!imageBuffer) {
      reply.code(404).send({ error: 'Page not found' })
      return
    }

    const ext = path.extname(request.url).toLowerCase()
    let contentType = 'image/jpeg'

    reply.header('Content-Type', contentType)
    reply.header('Cache-Control', 'no-cache')
    reply.send(imageBuffer)
  })

  app.post('/api/chapters/:id/backup', async (request, reply) => {
    const { id } = request.params as { id: string }
    try {
      const backupPath = await chapterService.backupChapter(parseInt(id))
      return { success: true, backupPath }
    } catch (e) {
      reply.code(500).send({ error: (e as Error).message })
    }
  })

  app.post('/api/chapters/:id/commit', async (request, reply) => {
    const { id } = request.params as { id: string }
    try {
      await chapterService.commitChapterEdit(parseInt(id))
      return { success: true }
    } catch (e) {
      reply.code(500).send({ error: (e as Error).message })
    }
  })

  app.post('/api/chapters/:id/revert', async (request, reply) => {
    const { id } = request.params as { id: string }
    try {
      await chapterService.revertChapterEdit(parseInt(id))
      return { success: true }
    } catch (e) {
      reply.code(500).send({ error: (e as Error).message })
    }
  })

  app.put('/api/chapters/:id/pages', async (request, reply) => {
    const { id } = request.params as { id: string }
    const chapterId = parseInt(id)

    const fields: Record<string, string> = {}
    const newFiles = new Map<string, Buffer>()

    const parts = request.parts()
    for await (const part of parts) {
      if (part.type === 'field') {
        fields[part.fieldname] = part.value as string
      } else if (part.type === 'file') {
        const buffer = await part.toBuffer()
        newFiles.set(part.fieldname, buffer)
      }
    }

    let operations: { type: 'original' | 'new'; index?: number; fileKey?: string }[] = []
    if (fields.operations) {
      try {
        operations = JSON.parse(fields.operations)
      } catch {
        reply.code(400).send({ error: 'Invalid operations JSON' })
        return
      }
    }

    try {
      const newPageCount = await chapterService.reorderPages(chapterId, operations, newFiles)
      return { success: true, pageCount: newPageCount }
    } catch (e) {
      reply.code(500).send({ error: (e as Error).message })
    }
  })
}
