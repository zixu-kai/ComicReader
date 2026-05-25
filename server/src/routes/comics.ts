import { FastifyInstance } from 'fastify'
import multipart from '@fastify/multipart'
import { comicService } from '@/services/comicService.js'
import { chapterService } from '@/services/chapterService.js'
import { scanService } from '@/services/scanService.js'
import { db, schema } from '@/db/index.js'
import { eq } from 'drizzle-orm'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import config from '@/config/index.js'
import AdmZip from 'adm-zip'

const { comics } = schema

export async function comicRoutes(app: FastifyInstance) {
  app.get('/api/comics', async (request) => {
    const query = request.query as any
    return comicService.listComics({
      page: parseInt(query.page) || undefined,
      pageSize: parseInt(query.pageSize) || undefined,
      sort: query.sort,
      order: query.order,
      categoryId: parseInt(query.categoryId) || undefined,
      tagId: parseInt(query.tagId) || undefined,
      status: query.status,
      readingStatus: query.readingStatus,
      query: query.query,
      author: query.author,
    })
  })

  app.get('/api/comics/search', async (request) => {
    const { q } = request.query as { q: string }
    if (!q) return []
    return comicService.searchComics(q)
  })

  app.get('/api/comics/random', async (request) => {
    const query = request.query as { count?: string; categoryId?: string }
    return comicService.getRandomComics(
      Number(query.count) || 10,
      Number(query.categoryId) || undefined
    )
  })

  app.get('/api/comics/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const comic = await comicService.getComic(parseInt(id))
    if (!comic) {
      reply.code(404).send({ error: 'Comic not found' })
      return
    }
    return comic
  })

  app.put('/api/comics/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const data = request.body as any
    const comic = await comicService.updateComic(parseInt(id), data)
    if (!comic) {
      reply.code(404).send({ error: 'Comic not found' })
      return
    }
    return comic
  })

  app.put('/api/comics/:id/metadata', async (request, reply) => {
    const { id } = request.params as { id: string }
    const data = request.body as { title?: string; author?: string; artist?: string; description?: string; status?: string; year?: number; tags?: string[]; categories?: string[] }
    const comicId = parseInt(id)
    const [comic] = await db.select().from(comics).where(eq(comics.id, comicId))
    if (!comic) {
      reply.code(404).send({ error: 'Comic not found' })
      return
    }
    await comicService.updateComic(comicId, { title: data.title, author: data.author, artist: data.artist, description: data.description, status: (data.status as any) || undefined, year: data.year })
    await scanService.updateComicInfo(comicId, data)
    return { success: true }
  })

  app.delete('/api/comics/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    await comicService.deleteComic(parseInt(id))
    reply.code(204).send()
  })

  app.post('/api/comics/scan', async (request) => {
    const body = request.body as { namingMode?: string } | undefined
    return comicService.scanLibrary(body?.namingMode)
  })

  app.get('/api/comics/:id/download', async (request, reply) => {
    const { id } = request.params as { id: string }
    const comicData = await comicService.getComic(parseInt(id))
    if (!comicData) {
      reply.code(404).send({ error: 'Comic not found' })
      return
    }

    const comicPath = comicData.path
    if (!fs.existsSync(comicPath)) {
      reply.code(404).send({ error: 'Comic path not found' })
      return
    }

    const stat = fs.statSync(comicPath)
    if (stat.isFile()) {
      const ext = path.extname(comicPath).toLowerCase()
      const fileName = `${comicData.title}${ext}`
      reply.header('Content-Type', 'application/octet-stream')
      reply.header('Content-Length', stat.size)
      reply.header('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`)
      return fs.createReadStream(comicPath)
    }

    if (stat.isDirectory()) {
      const zip = new AdmZip()
      zip.addLocalFolder(comicPath)
      const zipBuffer = zip.toBuffer()
      const fileName = `${comicData.title}.zip`
      reply.header('Content-Type', 'application/zip')
      reply.header('Content-Length', zipBuffer.length)
      reply.header('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`)
      reply.send(zipBuffer)
      return
    }

    reply.code(500).send({ error: 'Unknown file type' })
  })

  app.get('/api/comics/:id/cover', async (request, reply) => {
    const { id } = request.params as { id: string }
    const [comic] = await db.select({ coverPath: comics.coverPath }).from(comics).where(eq(comics.id, parseInt(id)))
    if (!comic?.coverPath || !fs.existsSync(comic.coverPath)) {
      reply.code(404).send({ error: 'Cover not found' })
      return
    }
    const ext = path.extname(comic.coverPath).toLowerCase()
    const mimeTypes: Record<string, string> = { '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png' }
    reply.header('Content-Type', mimeTypes[ext] || 'image/jpeg')
    reply.header('Cache-Control', 'public, max-age=86400')
    return fs.createReadStream(comic.coverPath)
  })

  app.put('/api/comics/:id/cover/page/:pageNum', async (request, reply) => {
    const { id, pageNum } = request.params as { id: string; pageNum: string }
    const [comic] = await db.select().from(comics).where(eq(comics.id, parseInt(id)))
    if (!comic) { reply.code(404).send({ error: 'Comic not found' }); return }

    const comicData = await comicService.getComic(parseInt(id))
    if (!comicData) { reply.code(404).send({ error: 'Comic not found' }); return }
    const chapters = await chapterService.getChapters(parseInt(id))
    if (chapters.length === 0) { reply.code(404).send({ error: 'No chapters found' }); return }

    const imageBuffer = await chapterService.getPageImage(chapters[0].id, parseInt(pageNum))
    if (!imageBuffer) { reply.code(404).send({ error: 'Page not found' }); return }

    if (!fs.existsSync(config.coversDir)) {
      fs.mkdirSync(config.coversDir, { recursive: true })
    }

    const coverPath = path.join(config.coversDir, `${id}.webp`)
    await sharp(imageBuffer)
      .resize(300, 450, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(coverPath)

    await db.update(comics).set({ coverPath, updatedAt: new Date().toISOString() }).where(eq(comics.id, parseInt(id)))
    return { success: true, coverPath }
  })

  await app.register(async (uploadScope) => {
    await uploadScope.register(multipart, { limits: { fileSize: 50 * 1024 * 1024 } })

    uploadScope.post('/api/comics/:id/cover', async (request, reply) => {
      const { id } = request.params as { id: string }
      const [comic] = await db.select().from(comics).where(eq(comics.id, parseInt(id)))
      if (!comic) { reply.code(404).send({ error: 'Comic not found' }); return }

      const data = await request.file()
      if (!data) { reply.code(400).send({ error: 'No file uploaded' }); return }

      const buffer = await data.toBuffer()
      if (!fs.existsSync(config.coversDir)) {
        fs.mkdirSync(config.coversDir, { recursive: true })
      }

      const coverPath = path.join(config.coversDir, `${id}.webp`)
      await sharp(buffer)
        .resize(300, 450, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(coverPath)

      await db.update(comics).set({ coverPath, updatedAt: new Date().toISOString() }).where(eq(comics.id, parseInt(id)))
      return { success: true, coverPath }
    })
  })
}
