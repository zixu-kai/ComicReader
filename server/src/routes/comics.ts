import { FastifyInstance } from 'fastify'
import multipart from '@fastify/multipart'
import { comicService } from '@/services/comicService.js'
import { chapterService } from '@/services/chapterService.js'
import { scanService, scanProgress } from '@/services/scanService.js'
import { db, schema } from '@/db/index.js'
import { eq } from 'drizzle-orm'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import config from '@/config/index.js'
import AdmZip from 'adm-zip'

const { comics } = schema

let comicScanStatus: 'idle' | 'scanning' | 'done' = 'idle'
let comicScanResult: any = null

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
    const { q, page, pageSize } = request.query as { q: string; page?: string; pageSize?: string }
    if (!q) return { data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 }
    const results = await comicService.searchComics(q)
    const p = parseInt(page || '1')
    const ps = parseInt(pageSize || '20')
    const start = (p - 1) * ps
    return {
      data: results.slice(start, start + ps),
      total: results.length,
      page: p,
      pageSize: ps,
      totalPages: Math.ceil(results.length / ps),
    }
  })

  app.get('/api/comics/random', async (request) => {
    const query = request.query as { count?: string; categoryId?: string }
    return comicService.getRandomComics(
      Number(query.count) || 10,
      Number(query.categoryId) || undefined
    )
  })

  app.put('/api/comics/batch', async (request, reply) => {
    const body = request.body as { ids?: number[]; categoryIds?: number[]; tagIds?: number[]; status?: string; year?: number; language?: string; score?: number; readingStatus?: string } | undefined
    if (!Array.isArray(body?.ids) || body!.ids!.length === 0) {
      reply.code(400).send({ error: 'ids array required' })
      return
    }
    const count = await comicService.batchUpdate(body!.ids!.map(Number), {
      categoryIds: body!.categoryIds,
      tagIds: body!.tagIds,
      status: body!.status,
      year: body!.year,
      language: body!.language,
      score: body!.score,
      readingStatus: body!.readingStatus,
    })
    return { success: true, count }
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
    const comicId = parseInt(id)
    // 元数据只写入数据库缓存；写回 CBZ 由"设置 → 写入元数据到CBZ"（手动或定时）统一执行
    const comic = await comicService.updateComic(comicId, data)
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
    return { success: true }
  })

  app.delete('/api/comics/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    await comicService.deleteComic(parseInt(id))
    reply.code(204).send()
  })

  app.post('/api/comics/scan', async (request) => {
    const body = request.body as { namingMode?: string; scope?: string } | undefined
    if (comicScanStatus === 'scanning') {
      return { status: 'scanning', message: '扫描进行中' }
    }
    const scope = body?.scope || 'all'
    if (scope !== 'all' && (scope.includes('/') || scope.includes('\\') || scope === '.' || scope === '..')) {
      return { status: 'error', message: '无效的扫描范围' }
    }
    comicScanStatus = 'scanning'
    comicScanResult = null
    scanProgress.phase = 'idle'
    scanProgress.total = 0
    scanProgress.processed = 0
    scanProgress.current = ''
    scanService.scanLibrary(scope).then((result) => {
      comicScanResult = result
      comicScanStatus = 'done'
    }).catch(() => {
      comicScanStatus = 'idle'
      scanProgress.phase = 'done'
    })
    return { status: 'scanning', message: '扫描已开始' }
  })

  app.get('/api/comics/scan/options', async () => {
    // 列出漫画目录下的子文件夹，供"扫描全部/扫描指定子文件夹"选择
    const folders: string[] = []
    try {
      const entries = fs.readdirSync(config.comicsDir, { withFileTypes: true })
      for (const entry of entries) {
        if (entry.isDirectory()) folders.push(entry.name)
      }
    } catch {}
    folders.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    return { folders }
  })

  app.get('/api/comics/scan/status', async () => {
    if (comicScanStatus === 'done') {
      comicScanStatus = 'idle'
      return { status: 'done', result: comicScanResult, progress: scanProgress }
    }
    return { status: comicScanStatus, progress: scanProgress }
  })

  app.post('/api/comics/:id/refresh', async (request, reply) => {
    const { id } = request.params as { id: string }
    const comicId = parseInt(id)
    const [comic] = await db.select().from(comics).where(eq(comics.id, comicId))
    if (!comic) {
      reply.code(404).send({ error: 'Comic not found' })
      return
    }
    try {
      const result = await scanService.refreshComic(comicId)
      return result
    } catch (err) {
      reply.code(500).send({ error: 'Refresh failed', message: err instanceof Error ? err.message : String(err) })
    }
  })

  app.get('/api/comics/:id/download', async (request, reply) => {
    const { id } = request.params as { id: string }
    const comicData = await comicService.getComic(parseInt(id))
    if (!comicData) {
      reply.code(404).send({ error: 'Comic not found' })
      return
    }

    const comicPath = comicData.path
    // 漫画路径可能是合成路径（扁平归档分组），真实文件在各章节 filePath 上
    const chapterRows = await chapterService.getChapters(parseInt(id))
    const chapterFiles = chapterRows.map(c => c.filePath).filter(p => fs.existsSync(p) && fs.statSync(p).isFile())

    if (fs.existsSync(comicPath)) {
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
    }

    if (chapterFiles.length === 1) {
      const filePath = chapterFiles[0]!
      const stat = fs.statSync(filePath)
      const fileName = path.basename(filePath)
      reply.header('Content-Type', 'application/octet-stream')
      reply.header('Content-Length', stat.size)
      reply.header('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`)
      return fs.createReadStream(filePath)
    }

    if (chapterFiles.length > 1) {
      const zip = new AdmZip()
      for (const f of chapterFiles) {
        zip.addLocalFile(f)
      }
      const zipBuffer = zip.toBuffer()
      const fileName = `${comicData.title}.zip`
      reply.header('Content-Type', 'application/zip')
      reply.header('Content-Length', zipBuffer.length)
      reply.header('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`)
      reply.send(zipBuffer)
      return
    }

    reply.code(404).send({ error: 'Comic files not found' })
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
