import fs from 'fs'
import path from 'path'
import AdmZip from 'adm-zip'
import sharp from 'sharp'
import { eq, sql } from 'drizzle-orm'
import { db, schema } from '@/db/index.js'
import config from '@/config/index.js'
import type { BookScanResult, BookFormat } from '@/types/index.js'
import { isBookFile, getBookFormat, sanitizeTitle } from '@/utils/index.js'

const { books, bookTags } = schema

const BOOK_EXTENSIONS = new Set(['.epub', '.pdf', '.txt', '.mobi', '.azw3'])

function extractEpubMetadata(epubPath: string): { title?: string; author?: string; description?: string; publisher?: string; publishDate?: string; language?: string; isbn?: string } {
  try {
    const zip = new AdmZip(epubPath)
    const entries = zip.getEntries()

    const containerEntry = entries.find(e => e.entryName === 'META-INF/container.xml')
    if (!containerEntry) return {}

    const containerXml = containerEntry.getData().toString('utf-8')
    const opfPathMatch = containerXml.match(/full-path="([^"]+)"/)
    if (!opfPathMatch) return {}

    const opfPath = opfPathMatch[1]
    const opfEntry = entries.find(e => e.entryName === opfPath)
    if (!opfEntry) return {}

    const opfXml = opfEntry.getData().toString('utf-8')

    const titleMatch = opfXml.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/i)
    const authorMatch = opfXml.match(/<dc:creator[^>]*>([^<]+)<\/dc:creator>/i)
    const descMatch = opfXml.match(/<dc:description[^>]*>([^<]+)<\/dc:description>/i)
    const publisherMatch = opfXml.match(/<dc:publisher[^>]*>([^<]+)<\/dc:publisher>/i)
    const dateMatch = opfXml.match(/<dc:date[^>]*>([^<]+)<\/dc:date>/i)
    const langMatch = opfXml.match(/<dc:language[^>]*>([^<]+)<\/dc:language>/i)
    const isbnMatch = opfXml.match(/<dc:identifier[^>]*>(?:urn:isbn:)?(\d[\d-]+)<\/dc:identifier>/i)

    return {
      title: titleMatch?.[1]?.trim(),
      author: authorMatch?.[1]?.trim(),
      description: descMatch?.[1]?.trim(),
      publisher: publisherMatch?.[1]?.trim(),
      publishDate: dateMatch?.[1]?.trim(),
      language: langMatch?.[1]?.trim(),
      isbn: isbnMatch?.[1]?.replace(/-/g, ''),
    }
  } catch {
    return {}
  }
}

async function extractEpubCover(epubPath: string, bookId: number): Promise<string | null> {
  try {
    const zip = new AdmZip(epubPath)
    const entries = zip.getEntries()

    const coverEntry = entries.find(e =>
      !e.isDirectory && (
        e.entryName.toLowerCase().includes('cover') &&
        /\.(jpg|jpeg|png|gif|webp)$/i.test(e.entryName)
      )
    )

    let imageBuffer: Buffer
    if (!coverEntry) {
      const imageEntry = entries.find(e =>
        !e.isDirectory &&
        /\.(jpg|jpeg|png|gif|webp)$/i.test(e.entryName) &&
        !e.entryName.startsWith('META-INF')
      )
      if (!imageEntry) return null
      imageBuffer = imageEntry.getData()
    } else {
      imageBuffer = coverEntry.getData()
    }

    if (!fs.existsSync(config.coversDir)) {
      fs.mkdirSync(config.coversDir, { recursive: true })
    }

    const coverPath = path.join(config.coversDir, `book_${bookId}.webp`)
    await sharp(imageBuffer)
      .resize(300, 450, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(coverPath)

    return coverPath
  } catch {
    return null
  }
}

async function ensureTag(name: string): Promise<number> {
  const [existing] = await db.select().from(schema.tags).where(eq(schema.tags.name, name))
  if (existing) return existing.id
  const [created] = await db.insert(schema.tags).values({ name }).returning()
  return created.id
}

export const bookScanService = {
  async scanBooks(namingMode: string = 'folder'): Promise<BookScanResult> {
    const result: BookScanResult = { added: 0, updated: 0, removed: 0, errors: [] }

    try {
      if (!fs.existsSync(config.booksDir)) {
        fs.mkdirSync(config.booksDir, { recursive: true })
        return result
      }

      const existingBooks = await db.select().from(books)
      const existingPathMap = new Map(existingBooks.map(b => [b.path, b]))

      const scanDir = (dir: string): string[] => {
        const found: string[] = []
        try {
          const entries = fs.readdirSync(dir, { withFileTypes: true })
          for (const entry of entries) {
            const fullPath = path.join(dir, entry.name)
            if (entry.isFile() && BOOK_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
              found.push(fullPath)
            } else if (entry.isDirectory()) {
              found.push(...scanDir(fullPath))
            }
          }
        } catch {}
        return found
      }

      const bookFiles = scanDir(config.booksDir)
      const scannedPaths = new Set<string>()

      for (const bookPath of bookFiles) {
        try {
          scannedPaths.add(bookPath)
          const format = getBookFormat(path.basename(bookPath))
          const stat = fs.statSync(bookPath)
          const fileSize = stat.size

          let title = sanitizeTitle(path.basename(bookPath))
          let author: string | null = null
          let description: string | null = null
          let publisher: string | null = null
          let publishDate: string | null = null
          let isbn: string | null = null
          let language: string | null = null
          let pageCount = 0

          if (format === 'epub') {
            const meta = extractEpubMetadata(bookPath)
            if (namingMode === 'metadata' && meta.title) {
              title = meta.title
            }
            author = meta.author || null
            description = meta.description || null
            publisher = meta.publisher || null
            publishDate = meta.publishDate || null
            isbn = meta.isbn || null
            language = meta.language || null
          }

          const titleSort = title.toLowerCase().replace(/^(the|a|an)\s+/i, '')

          const existing = existingPathMap.get(bookPath)

          if (existing) {
            const lastModified = stat.mtime.toISOString()
            if (lastModified > existing.updatedAt) {
              await db.update(books).set({
                title,
                titleSort,
                author: author || existing.author,
                description: description || existing.description,
                publisher: publisher || existing.publisher,
                publishDate: publishDate || existing.publishDate,
                isbn: isbn || existing.isbn,
                language: language || existing.language,
                fileSize,
                updatedAt: new Date().toISOString(),
              }).where(eq(books.id, existing.id))

              if (format === 'epub') {
                const coverPath = await extractEpubCover(bookPath, existing.id)
                if (coverPath) {
                  await db.update(books).set({ coverPath }).where(eq(books.id, existing.id))
                }
              }

              result.updated++
            }
          } else {
            const [inserted] = await db.insert(books).values({
              title,
              titleSort,
              author,
              description,
              publisher,
              publishDate,
              isbn,
              language,
              pageCount,
              format,
              path: bookPath,
              fileSize,
            }).returning()

            const bookId = inserted.id

            if (format === 'epub') {
              const coverPath = await extractEpubCover(bookPath, bookId)
              if (coverPath) {
                await db.update(books).set({ coverPath }).where(eq(books.id, bookId))
              }
            }

            result.added++
          }
        } catch (err) {
          result.errors.push(`Error processing ${path.basename(bookPath)}: ${err instanceof Error ? err.message : String(err)}`)
        }
      }

      for (const [bookPath, book] of existingPathMap) {
        if (!scannedPaths.has(bookPath)) {
          await db.delete(books).where(eq(books.id, book.id))
          result.removed++
        }
      }
    } catch (err) {
      result.errors.push(`Scan error: ${err instanceof Error ? err.message : String(err)}`)
    }

    return result
  },
}
