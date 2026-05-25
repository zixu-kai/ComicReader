import { FastifyInstance } from 'fastify'
import multipart from '@fastify/multipart'
import { bookService } from '@/services/bookService.js'
import { bookProgressService } from '@/services/bookProgressService.js'
import { db, schema } from '@/db/index.js'
import { eq, asc } from 'drizzle-orm'
import fs from 'fs'
import path from 'path'

const textCache = new Map<string, { text: string; timestamp: number }>()
const TEXT_CACHE_TTL = 5 * 60 * 1000

function getDecodedText(filePath: string): string {
  const now = Date.now()
  const cached = textCache.get(filePath)
  if (cached && now - cached.timestamp < TEXT_CACHE_TTL) {
    return cached.text
  }
  const buffer = fs.readFileSync(filePath)
  let text: string
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(buffer)
  } catch {
    text = new TextDecoder('gbk').decode(buffer)
  }
  textCache.set(filePath, { text, timestamp: now })
  return text
}
import sharp from 'sharp'
import config from '@/config/index.js'
import AdmZip from 'adm-zip'

const { books } = schema
const { bookChapters } = schema

export async function bookRoutes(app: FastifyInstance) {
  app.get('/api/books', async (request) => {
    const query = request.query as any
    return bookService.listBooks({
      page: parseInt(query.page) || undefined,
      pageSize: parseInt(query.pageSize) || undefined,
      sort: query.sort,
      order: query.order,
      tagId: parseInt(query.tagId) || undefined,
      format: query.format,
      readingStatus: query.readingStatus,
      query: query.query,
      author: query.author,
    })
  })

  app.get('/api/books/search', async (request) => {
    const { q } = request.query as { q: string }
    if (!q) return []
    return bookService.searchBooks(q)
  })

  app.get('/api/books/random', async (request) => {
    const query = request.query as { count?: string }
    return bookService.getRandomBooks(parseInt(query.count || '10'))
  })

  app.get('/api/books/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const book = await bookService.getBook(parseInt(id))
    if (!book) {
      reply.code(404).send({ error: 'Book not found' })
      return
    }
    return book
  })

  app.put('/api/books/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const data = request.body as any
    const book = await bookService.updateBook(parseInt(id), data)
    if (!book) {
      reply.code(404).send({ error: 'Book not found' })
      return
    }
    return book
  })

  app.delete('/api/books/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    await bookService.deleteBook(parseInt(id))
    reply.code(204).send()
  })

  app.post('/api/books/scan', async (request) => {
    const body = request.body as { namingMode?: string } | undefined
    return bookService.scanBooks(body?.namingMode)
  })

  app.get('/api/books/:id/cover', async (request, reply) => {
    const { id } = request.params as { id: string }
    const [book] = await db.select({ coverPath: books.coverPath }).from(books).where(eq(books.id, parseInt(id)))
    if (!book?.coverPath || !fs.existsSync(book.coverPath)) {
      reply.code(404).send({ error: 'Cover not found' })
      return
    }
    const ext = path.extname(book.coverPath).toLowerCase()
    const mimeTypes: Record<string, string> = { '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png' }
    reply.header('Content-Type', mimeTypes[ext] || 'image/jpeg')
    reply.header('Cache-Control', 'public, max-age=86400')
    return fs.createReadStream(book.coverPath)
  })

  app.get('/api/books/:id/chapters', async (request, reply) => {
    const { id } = request.params as { id: string }
    const bookId = parseInt(id)
    const book = await bookService.getBook(bookId)
    if (!book) {
      reply.code(404).send({ error: 'Book not found' })
      return
    }

    const savedChapters = await db.select({
      title: bookChapters.title,
      startPos: bookChapters.startPos,
      endPos: bookChapters.endPos,
    }).from(bookChapters).where(eq(bookChapters.bookId, bookId)).orderBy(bookChapters.sortOrder)

    if (savedChapters.length > 0) {
      reply.code(200).send(savedChapters)
      return
    }

    const filePath = book.path
    if (!fs.existsSync(filePath)) {
      reply.code(404).send({ error: 'File not found' })
      return
    }

    const ext = path.extname(filePath).toLowerCase()
    if (ext === '.txt') {
      const buffer = fs.readFileSync(filePath)
      let text: string
      try {
        text = new TextDecoder('utf-8', { fatal: true }).decode(buffer)
      } catch {
        text = new TextDecoder('gbk').decode(buffer)
      }
      const chapters = parseTxtChapters(text)
      reply.code(200).send(chapters)
    } else if (ext === '.epub') {
      const chapters = parseEpubChapters(filePath)
      reply.code(200).send(chapters)
    } else {
      reply.code(200).send([])
    }
  })

  app.put('/api/books/:id/chapters', async (request, reply) => {
    const { id } = request.params as { id: string }
    const bookId = parseInt(id)
    const book = await bookService.getBook(bookId)
    if (!book) {
      reply.code(404).send({ error: 'Book not found' })
      return
    }

    const { chapters } = request.body as { chapters: { title: string; startPos: number; endPos: number; index: number }[] }
    if (!Array.isArray(chapters)) {
      reply.code(400).send({ error: 'Chapters array required' })
      return
    }

    await db.delete(bookChapters).where(eq(bookChapters.bookId, bookId))

    if (chapters.length > 0) {
      const now = new Date().toISOString()
      await db.insert(bookChapters).values(
        chapters.map((ch) => ({
          bookId,
          title: ch.title,
          startPos: ch.startPos,
          endPos: ch.endPos,
          sortOrder: ch.index,
          createdAt: now,
          updatedAt: now,
        }))
      )
    }

    reply.code(200).send({ success: true })
  })

  app.get('/api/books/:id/file', async (request, reply) => {
    const { id } = request.params as { id: string }
    const book = await bookService.getBook(parseInt(id))
    if (!book) {
      reply.code(404).send({ error: 'Book not found' })
      return
    }

    const filePath = book.path
    if (!fs.existsSync(filePath)) {
      reply.code(404).send({ error: 'File not found' })
      return
    }

    const ext = path.extname(filePath).toLowerCase()
    const mimeTypes: Record<string, string> = {
      '.epub': 'application/epub+zip',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain; charset=utf-8',
      '.mobi': 'application/x-mobipocket-ebook',
      '.azw3': 'application/vnd.amazon.mobi8-ebook',
    }

    const contentType = mimeTypes[ext] || 'application/octet-stream'
    const stat = fs.statSync(filePath)
    const fileSize = stat.size

    reply.header('Content-Type', contentType)
    reply.header('Accept-Ranges', 'bytes')
    reply.header('Content-Disposition', `inline; filename="${encodeURIComponent(path.basename(filePath))}"`)
    reply.header('Cache-Control', 'no-cache')

    const rangeHeader = request.headers.range
    if (rangeHeader) {
      const matches = /bytes=(\d+)-(\d*)/.exec(rangeHeader)
      if (!matches) {
        reply.code(416).send()
        return
      }
      const start = parseInt(matches[1])
      const end = matches[2] ? parseInt(matches[2]) : fileSize - 1
      if (start >= fileSize || end >= fileSize) {
        reply.header('Content-Range', `bytes */${fileSize}`)
        reply.code(416).send()
        return
      }
      const chunkSize = end - start + 1
      reply.header('Content-Range', `bytes ${start}-${end}/${fileSize}`)
      reply.header('Content-Length', chunkSize)
      reply.code(206)
      return fs.createReadStream(filePath, { start, end })
    }

    reply.header('Content-Length', fileSize)
    return fs.createReadStream(filePath)
  })

  app.get('/api/books/:id/text-range', async (request, reply) => {
    const { id } = request.params as { id: string }
    const { start, end } = request.query as { start?: string; end?: string }
    const book = await bookService.getBook(parseInt(id))
    if (!book) {
      reply.code(404).send({ error: 'Book not found' })
      return
    }

    const filePath = book.path
    if (!fs.existsSync(filePath)) {
      reply.code(404).send({ error: 'File not found' })
      return
    }

    const ext = path.extname(filePath).toLowerCase()
    if (ext !== '.txt') {
      reply.code(400).send({ error: 'Only TXT files supported' })
      return
    }

    const text = getDecodedText(filePath)
    const startIdx = Math.max(0, parseInt(start || '0') || 0)
    const requestedEnd = parseInt(end || '0') || 0
    const MAX_RANGE = 50000
    const endIdx = requestedEnd > 0
      ? Math.min(requestedEnd, startIdx + MAX_RANGE)
      : startIdx + MAX_RANGE
    const actualEnd = Math.min(endIdx, text.length)

    reply.header('Content-Type', 'text/plain; charset=utf-8')
    reply.header('Cache-Control', 'no-cache')
    reply.send({ text: text.slice(startIdx, actualEnd), totalLength: text.length })
  })

  app.put('/api/books/:id/text', async (request, reply) => {
    const { id } = request.params as { id: string }
    const book = await bookService.getBook(parseInt(id))
    if (!book) {
      reply.code(404).send({ error: 'Book not found' })
      return
    }

    const filePath = book.path
    if (!fs.existsSync(filePath)) {
      reply.code(404).send({ error: 'File not found' })
      return
    }

    const ext = path.extname(filePath).toLowerCase()
    if (ext !== '.txt') {
      reply.code(400).send({ error: 'Only TXT files can be edited' })
      return
    }

    const { text } = request.body as { text: string }
    if (typeof text !== 'string') {
      reply.code(400).send({ error: 'Text content required' })
      return
    }

    fs.writeFileSync(filePath, text, 'utf-8')
    const stat = fs.statSync(filePath)
    await db.update(schema.books).set({ fileSize: stat.size, updatedAt: new Date().toISOString() }).where(eq(schema.books.id, parseInt(id)))

    return { success: true }
  })

  app.get('/api/books/:id/download', async (request, reply) => {
    const { id } = request.params as { id: string }
    const book = await bookService.getBook(parseInt(id))
    if (!book) {
      reply.code(404).send({ error: 'Book not found' })
      return
    }

    const filePath = book.path
    if (!fs.existsSync(filePath)) {
      reply.code(404).send({ error: 'File not found' })
      return
    }

    const ext = path.extname(filePath).toLowerCase()
    const mimeTypes: Record<string, string> = {
      '.epub': 'application/epub+zip',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain; charset=utf-8',
      '.mobi': 'application/x-mobipocket-ebook',
      '.azw3': 'application/vnd.amazon.mobi8-ebook',
    }

    const contentType = mimeTypes[ext] || 'application/octet-stream'
    const stat = fs.statSync(filePath)
    const fileName = `${book.title}${ext}`

    reply.header('Content-Type', 'application/octet-stream')
    reply.header('Content-Length', stat.size)
    reply.header('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`)
    return fs.createReadStream(filePath)
  })

  app.get('/api/books/:id/export-epub', async (request, reply) => {
    const { id } = request.params as { id: string }
    const book = await bookService.getBook(parseInt(id))
    if (!book) {
      reply.code(404).send({ error: 'Book not found' })
      return
    }

    const filePath = book.path
    if (!fs.existsSync(filePath)) {
      reply.code(404).send({ error: 'File not found' })
      return
    }

    const ext = path.extname(filePath).toLowerCase()

    if (ext === '.epub') {
      const stat = fs.statSync(filePath)
      const fileName = `${book.title}.epub`
      reply.header('Content-Type', 'application/epub+zip')
      reply.header('Content-Length', stat.size)
      reply.header('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`)
      return fs.createReadStream(filePath)
    }

    if (ext === '.txt') {
      const buffer = fs.readFileSync(filePath)
      let text: string
      try {
        text = new TextDecoder('utf-8', { fatal: true }).decode(buffer)
      } catch {
        text = new TextDecoder('gbk').decode(buffer)
      }

      const zip = new AdmZip()
      zip.addFile('mimetype', Buffer.from('application/epub+zip'), '', 0o644)

      const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`
      zip.addFile('META-INF/container.xml', Buffer.from(containerXml))

      const chapters = splitTxtToChapters(text)
      const manifestItems: string[] = []
      const spineItems: string[] = []
      const navItems: string[] = []

      chapters.forEach((ch, i) => {
        const id = `chapter${i + 1}`
        const href = `${id}.xhtml`
        const htmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>${escapeXml(ch.title)}</title>
<link rel="stylesheet" type="text/css" href="style.css"/></head>
<body>
<h2>${escapeXml(ch.title)}</h2>
${ch.content.split('\n').map(p => `<p>${escapeXml(p)}</p>`).join('\n')}
</body></html>`
        zip.addFile(`OEBPS/${href}`, Buffer.from(htmlContent))
        manifestItems.push(`<item id="${id}" href="${href}" media-type="application/xhtml+xml"/>`)
        spineItems.push(`<itemref idref="${id}"/>`)
        navItems.push(`<li><a href="${href}">${escapeXml(ch.title)}</a></li>`)
      })

      const coverImageId = book.coverPath && fs.existsSync(book.coverPath) ? 'cover-image' : ''
      if (coverImageId) {
        const coverExt = path.extname(book.coverPath!).toLowerCase()
        const coverMime = coverExt === '.png' ? 'image/png' : 'image/jpeg'
        const coverBuffer = fs.readFileSync(book.coverPath!)
        zip.addFile(`OEBPS/cover${coverExt}`, coverBuffer)
        manifestItems.push(`<item id="${coverImageId}" href="cover${coverExt}" media-type="${coverMime}" properties="cover-image"/>`)
      }

      const styleCss = `body { font-family: serif; margin: 1em; line-height: 1.6; }
h2 { margin-top: 1.5em; margin-bottom: 0.5em; }
p { margin: 0.5em 0; text-indent: 2em; }`
      zip.addFile('OEBPS/style.css', Buffer.from(styleCss))

      const opfContent = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="BookId">urn:uuid:${crypto.randomUUID()}</dc:identifier>
    <dc:title>${escapeXml(book.title)}</dc:title>
    <dc:language>${book.language || 'zh'}</dc:language>
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')}</meta>
    ${book.author ? `<dc:creator>${escapeXml(book.author)}</dc:creator>` : ''}
    ${book.description ? `<dc:description>${escapeXml(book.description)}</dc:description>` : ''}
    ${book.publisher ? `<dc:publisher>${escapeXml(book.publisher)}</dc:publisher>` : ''}
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    ${manifestItems.join('\n    ')}
  </manifest>
  <spine>
    ${spineItems.join('\n    ')}
  </spine>
</package>`
      zip.addFile('OEBPS/content.opf', Buffer.from(opfContent))

      const navXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head><title>目录</title></head>
<body>
<nav epub:type="toc">
  <h1>目录</h1>
  <ol>${navItems.join('')}</ol>
</nav>
</body></html>`
      zip.addFile('OEBPS/nav.xhtml', Buffer.from(navXhtml))

      const epubBuffer = zip.toBuffer()
      const fileName = `${book.title}.epub`
      reply.header('Content-Type', 'application/epub+zip')
      reply.header('Content-Length', epubBuffer.length)
      reply.header('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`)
      reply.send(epubBuffer)
      return
    }

    reply.code(400).send({ error: 'This format cannot be exported as EPUB' })
  })

  app.get('/api/books/:id/progress', async (request) => {
    const { id } = request.params as { id: string }
    return bookProgressService.getProgress(parseInt(id))
  })

  app.put('/api/books/:id/progress', async (request) => {
    const { id } = request.params as { id: string }
    const data = request.body as any
    return bookProgressService.updateProgress(parseInt(id), data)
  })

  app.put('/api/books/:id/progress/complete', async (request) => {
    const { id } = request.params as { id: string }
    await bookProgressService.markCompleted(parseInt(id))
    return { success: true }
  })

  app.get('/api/books/:id/notes', async (request) => {
    const { id } = request.params as { id: string }
    return bookProgressService.getNotes(parseInt(id))
  })

  app.post('/api/books/:id/notes', async (request) => {
    const { id } = request.params as { id: string }
    const data = request.body as any
    return bookProgressService.createNote(parseInt(id), data)
  })

  app.delete('/api/books/:id/notes/:noteId', async (request) => {
    const { id, noteId } = request.params as { id: string; noteId: string }
    await bookProgressService.deleteNote(parseInt(id), parseInt(noteId))
    return { success: true }
  })

  app.get('/api/books/:id/bookmarks', async (request) => {
    const { id } = request.params as { id: string }
    return bookProgressService.getBookmarks(parseInt(id))
  })

  app.post('/api/books/:id/bookmarks', async (request) => {
    const { id } = request.params as { id: string }
    const data = request.body as any
    return bookProgressService.createBookmark(parseInt(id), data)
  })

  app.delete('/api/books/:id/bookmarks/:bookmarkId', async (request) => {
    const { id, bookmarkId } = request.params as { id: string; bookmarkId: string }
    await bookProgressService.deleteBookmark(parseInt(id), parseInt(bookmarkId))
    return { success: true }
  })

  await app.register(async (uploadScope) => {
    await uploadScope.register(multipart, { limits: { fileSize: 50 * 1024 * 1024 } })

    uploadScope.post('/api/books/:id/cover', async (request, reply) => {
      const { id } = request.params as { id: string }
      const [book] = await db.select().from(books).where(eq(books.id, parseInt(id)))
      if (!book) { reply.code(404).send({ error: 'Book not found' }); return }

      const data = await request.file()
      if (!data) { reply.code(400).send({ error: 'No file uploaded' }); return }

      const buffer = await data.toBuffer()
      if (!fs.existsSync(config.coversDir)) {
        fs.mkdirSync(config.coversDir, { recursive: true })
      }

      const coverPath = path.join(config.coversDir, `book_${id}.webp`)
      await sharp(buffer)
        .resize(300, 450, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(coverPath)

      await db.update(books).set({ coverPath, updatedAt: new Date().toISOString() }).where(eq(books.id, parseInt(id)))
      return { success: true, coverPath }
    })
  })
}

function splitTxtToChapters(text: string): { title: string; content: string }[] {
  const patterns = [
    /^第[零一二三四五六七八九十百千万\d]+[章节回卷集部篇话]/,
    /^Chapter\s+\d+/i,
    /^卷[零一二三四五六七八九十百千万\d]+/,
    /^序[章言篇]/,
    /^(前言|引言|引子|导读)/,
    /^(后记|后序|尾声|终章|完结篇?|写在最后)/,
    /^(番外[篇章]?|附录)/,
  ]

  const lines = text.split('\n')
  const matches: { title: string; lineIndex: number }[] = []

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i]!.trim()
    if (!trimmed || trimmed.length >= 60) continue

    for (const pat of patterns) {
      if (pat.test(trimmed)) {
        matches.push({ title: trimmed.slice(0, 60), lineIndex: i })
        break
      }
    }
  }

  if (matches.length === 0) {
    const chunkSize = 5000
    const result: { title: string; content: string }[] = []
    for (let i = 0; i < text.length; i += chunkSize) {
      result.push({ title: `第${result.length + 1}部分`, content: text.slice(i, i + chunkSize) })
    }
    return result
  }

  const result: { title: string; content: string }[] = []
  if (matches[0]!.lineIndex > 0) {
    const prefix = lines.slice(0, matches[0]!.lineIndex).join('\n').trim()
    if (prefix) result.push({ title: '开头', content: prefix })
  }

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i]!.lineIndex
    const end = i < matches.length - 1 ? matches[i + 1]!.lineIndex : lines.length
    result.push({ title: matches[i]!.title, content: lines.slice(start + 1, end).join('\n') })
  }

  return result
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

function parseTxtChapters(text: string): { title: string; startPos: number }[] {
  const lines = text.split('\n')
  const lineIndexToCharPos: number[] = []
  let charPos = 0
  for (const line of lines) {
    lineIndexToCharPos.push(charPos)
    charPos += line.length + 1
  }

  const patternGroups = [
    [/^第[零一二三四五六七八九十百千万\d]+章/, /^第[零一二三四五六七八九十百千万\d]+节/],
    [/^第[零一二三四五六七八九十百千万\d]+[章节回卷集部篇话]/],
    [/^Chapter\s+\d+/i],
    [/^[【[]第[零一二三四五六七八九十百千万\d]+[章节回卷集部篇话][】\]]/],
    [/^第[零一二三四五六七八九十百千万\d]+[部分]/],
    [/^卷[零一二三四五六七八九十百千万\d]+/],
  ]

  const midSentencePunc = /[，。！？]/
  const MIN_GAP = 100

  let bestMatches: { title: string; startPos: number }[] = []

  for (const group of patternGroups) {
    const matches: { title: string; startPos: number }[] = []
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i]!.trim()
      if (trimmed.length === 0) continue
      for (const pat of group) {
        const m = trimmed.match(pat)
        if (m) {
          if (trimmed.length >= 60) break
          if (midSentencePunc.test(trimmed.slice(m[0].length))) break
          const pos = lineIndexToCharPos[i]!
          const lastMatch = matches[matches.length - 1]
          if (lastMatch && pos - lastMatch.startPos < MIN_GAP) break
          matches.push({ title: trimmed.slice(0, 60), startPos: pos })
          break
        }
      }
    }
    if (matches.length > bestMatches.length) {
      bestMatches = matches
    }
  }

  if (bestMatches.length === 0) {
    const chunkSize = 5000
    const result: { title: string; startPos: number }[] = []
    for (let i = 0; i < text.length; i += chunkSize) {
      result.push({ title: `第${result.length + 1}部分`, startPos: i })
    }
    return result
  }

  return bestMatches
}

function parseEpubChapters(filePath: string): { title: string; startPos: number }[] {
  try {
    const zip = new AdmZip(filePath)
    const entries = zip.getEntries()

    const containerEntry = entries.find(e => e.entryName === 'META-INF/container.xml')
    if (!containerEntry) return []

    const containerXml = containerEntry.getData().toString('utf-8')
    const contentPathMatch = containerXml.match(/full-path="([^"]+)"/)
    if (!contentPathMatch) return []

    const contentPath = contentPathMatch[1]!
    const contentDir = path.dirname(contentPath)

    const contentEntry = entries.find(e => e.entryName === contentPath)
    if (!contentEntry) return []

    const contentXml = contentEntry.getData().toString('utf-8')

    const navHrefMatch = contentXml.match(/<nav[^>]*href="([^"]+)"[^>]*properties="[^"]*nav[^"]*"/)
    const ncxHrefMatch = contentXml.match(/<item[^>]*href="([^"]+)"[^>]*media-type="application\/x-dtbncx\+xml"/)

    const chapters: { title: string; startPos: number }[] = []

    if (navHrefMatch) {
      const navPath = contentDir ? `${contentDir}/${navHrefMatch[1]!}` : navHrefMatch[1]!
      const navEntry = entries.find(e => e.entryName === navPath || e.entryName === decodeURIComponent(navPath))
      if (navEntry) {
        const navXml = navEntry.getData().toString('utf-8')
        const tocSection = navXml.match(/<nav[^>]*epub:type="[^"]*toc[^"]*"[^>]*>([\s\S]*?)<\/nav>/)
          || navXml.match(/<nav[^>]*>([\s\S]*?)<\/nav>/)

        if (tocSection) {
          const linkRegex = /<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g
          let match
          let pos = 0
          while ((match = linkRegex.exec(tocSection[1]!)) !== null) {
            const title = match[2]!.replace(/<[^>]+>/g, '').trim()
            if (title) {
              chapters.push({ title: title.slice(0, 60), startPos: pos })
              pos++
            }
          }
        }
      }
    }

    if (chapters.length === 0 && ncxHrefMatch) {
      const ncxPath = contentDir ? `${contentDir}/${ncxHrefMatch[1]!}` : ncxHrefMatch[1]!
      const ncxEntry = entries.find(e => e.entryName === ncxPath || e.entryName === decodeURIComponent(ncxPath))
      if (ncxEntry) {
        const ncxXml = ncxEntry.getData().toString('utf-8')
        const pointRegex = /<navLabel[^>]*>[\s\S]*?<text>([\s\S]*?)<\/text>[\s\S]*?<\/navLabel>/g
        let match
        let pos = 0
        while ((match = pointRegex.exec(ncxXml)) !== null) {
          const title = match[1]!.trim()
          if (title) {
            chapters.push({ title: title.slice(0, 60), startPos: pos })
            pos++
          }
        }
      }
    }

    if (chapters.length === 0) {
      const spineMatch = contentXml.match(/<spine[^>]*>([\s\S]*?)<\/spine>/)
      if (spineMatch) {
        const itemrefRegex = /idref="([^"]+)"/g
        const itemRegex = /<item[^>]*id="([^"]+)"[^>]*href="([^"]+)"[^>]*\/>/g
        const itemMap = new Map<string, string>()
        let itemMatch
        while ((itemMatch = itemRegex.exec(contentXml)) !== null) {
          itemMap.set(itemMatch[1]!, itemMatch[2]!)
        }

        let refMatch
        let pos = 0
        while ((refMatch = itemrefRegex.exec(spineMatch[1]!)) !== null) {
          const href = itemMap.get(refMatch[1]!)
          if (href) {
            const name = path.basename(href, path.extname(href))
            chapters.push({ title: name, startPos: pos })
            pos++
          }
        }
      }
    }

    return chapters
  } catch {
    return []
  }
}