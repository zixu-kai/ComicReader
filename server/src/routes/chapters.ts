import { FastifyInstance } from 'fastify'
import multipart from '@fastify/multipart'
import { chapterService } from '@/services/chapterService.js'
import sharp from 'sharp'

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

    // ?w= 宽度参数：按需降采样为 WebP，用于缩略图/移动端，降低带宽
    const { w } = request.query as { w?: string }
    const maxWidth = w ? parseInt(w, 10) : 0
    let outBuffer: Buffer = imageBuffer
    let contentType = 'image/jpeg'

    if (maxWidth > 0 && maxWidth < 4096) {
      try {
        outBuffer = await sharp(imageBuffer)
          .resize({ width: maxWidth, withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer()
        contentType = 'image/webp'
      } catch {
        outBuffer = imageBuffer
        contentType = 'image/jpeg'
      }
    }

    reply.header('Content-Type', contentType)
    // 页面图片很少变动，长缓存 + 前端 cache-buster 保证编辑后可见
    reply.header('Cache-Control', 'public, max-age=86400')
    reply.send(outBuffer)
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
