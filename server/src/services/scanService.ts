import fs from 'fs'
import path from 'path'
import AdmZip from 'adm-zip'
import sharp from 'sharp'
import { XMLParser, XMLBuilder } from 'fast-xml-parser'
import { eq, sql } from 'drizzle-orm'
import { db, schema } from '@/db/index.js'
import config from '@/config/index.js'
import type { ScanResult, FileType } from '@/types/index.js'
import { isImageFile, isComicArchive, getFileType, naturalSort, sanitizeTitle, cleanSeriesTitle } from '@/utils/index.js'

const { comics, chapters, comicCategories, comicTags } = schema

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.avif'])

interface ComicInfo {
  title?: string
  series?: string
  author?: string
  artist?: string
  description?: string
  status?: string
  year?: number
  language?: string
  tags?: string[]
  categories?: string[]
  volume?: number
  chapterNumber?: number
  manga?: string
  publisher?: string
  count?: number
  number?: number
}

function parseComicInfoXml(xmlContent: string): ComicInfo {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  })
  try {
    const result = parser.parse(xmlContent)
    const info = result.ComicInfo || result.comicinfo || {}
    const countVal = parseInt(info.Count || info.count) || undefined
    const numberVal = parseInt(info.Number || info.number) || undefined
    let status: string | undefined
    if (info.PublishingStatus || info.publishingStatus || info.PublishingStatusTachiyomi) {
      const ps = (info.PublishingStatus || info.publishingStatus || info.PublishingStatusTachiyomi || '').toLowerCase()
      if (ps.includes('ongoing')) status = 'ongoing'
      else if (ps.includes('completed') || ps.includes('finished')) status = 'completed'
    } else if (countVal && numberVal && numberVal >= countVal) {
      status = 'completed'
    } else if (countVal) {
      status = 'ongoing'
    }
    const tags = parseListField(info.Tags || info.tags || info.Genre || info.genre) || []
    const mangaVal = (info.Manga || info.manga || '').toLowerCase()
    if (mangaVal === 'yes' || mangaVal === 'true') {
      if (!tags.some(t => t.toLowerCase() === 'manga')) {
        tags.push('Manga')
      }
    }
    return {
      title: info.Title || info.title || undefined,
      series: info.Series || info.series || undefined,
      author: info.Writer || info.writer || undefined,
      artist: info.Penciller || info.penciller || info.Artist || info.artist || undefined,
      description: info.Summary || info.summary || info.Description || info.description || undefined,
      status,
      year: parseInt(info.Year || info.year) || undefined,
      language: info.LanguageISO || info.languageISO || info.Language || info.language || undefined,
      tags: tags.length > 0 ? tags : undefined,
      categories: parseListField(info.Categories || info.categories),
      volume: parseInt(info.Volume || info.volume) || undefined,
      chapterNumber: numberVal,
      manga: mangaVal || undefined,
      publisher: info.Publisher || info.publisher || undefined,
      count: countVal,
      number: numberVal,
    }
  } catch {
    return {}
  }
}

function parseListField(value: string | undefined): string[] | undefined {
  if (!value) return undefined
  return String(value).split(/[,;|]/).map(s => s.trim()).filter(Boolean)
}

function extractComicInfoFromFolder(folderPath: string): ComicInfo {
  try {
    const xmlPath = path.join(folderPath, 'ComicInfo.xml')
    if (fs.existsSync(xmlPath)) {
      const xmlContent = fs.readFileSync(xmlPath, 'utf-8')
      return parseComicInfoXml(xmlContent)
    }
    const entries = fs.readdirSync(folderPath, { withFileTypes: true })
    const archives = entries
      .filter(e => e.isFile() && isComicArchive(e.name))
      .sort((a, b) => naturalSort(a.name, b.name))
    for (const archive of archives) {
      const info = extractComicInfoFromArchive(path.join(folderPath, archive.name))
      if (info.series || info.title) return info
    }
  } catch {}
  return {}
}

function extractComicInfoFromArchive(archivePath: string): ComicInfo {
  try {
    const zip = new AdmZip(archivePath)
    const comicInfoEntry = zip.getEntries().find(
      e => !e.isDirectory && e.entryName.toLowerCase().endsWith('comicinfo.xml')
    )
    if (comicInfoEntry) {
      const xmlContent = comicInfoEntry.getData().toString('utf-8')
      return parseComicInfoXml(xmlContent)
    }
  } catch {}
  return {}
}

function writeComicInfoToFolder(folderPath: string, comicInfo: ComicInfo): void {
  try {
    const xmlPath = path.join(folderPath, 'ComicInfo.xml')
    if (fs.existsSync(xmlPath)) return

    const builder = new XMLBuilder({ ignoreAttributes: false, attributeNamePrefix: '@_', format: true })
    const infoObj: Record<string, string> = {}
    if (comicInfo.series) infoObj.Series = comicInfo.series
    if (comicInfo.title) infoObj.Title = comicInfo.title
    if (comicInfo.author) infoObj.Writer = comicInfo.author
    if (comicInfo.artist) infoObj.Penciller = comicInfo.artist
    if (comicInfo.description) infoObj.Summary = comicInfo.description
    if (comicInfo.year) infoObj.Year = String(comicInfo.year)
    if (comicInfo.language) infoObj.LanguageISO = comicInfo.language
    if (comicInfo.tags && comicInfo.tags.length > 0) infoObj.Tags = comicInfo.tags.join(', ')
    if (comicInfo.categories && comicInfo.categories.length > 0) infoObj.Categories = comicInfo.categories.join(', ')
    if (comicInfo.status) infoObj.PublishingStatus = comicInfo.status === 'ongoing' ? 'Ongoing' : comicInfo.status === 'completed' ? 'Completed' : 'Unknown'
    if (comicInfo.publisher) infoObj.Publisher = comicInfo.publisher
    if (comicInfo.manga) infoObj.Manga = comicInfo.manga
    if (comicInfo.count) infoObj.Count = String(comicInfo.count)
    if (comicInfo.number) infoObj.Number = String(comicInfo.number)

    const xmlObj = { ComicInfo: infoObj }
    const xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n' + builder.build(xmlObj)
    fs.writeFileSync(xmlPath, xmlContent, 'utf-8')
  } catch (err) {
    console.error(`Failed to write ComicInfo.xml to ${folderPath}:`, err)
  }
}

function ensureComicInfoInArchive(archivePath: string, comicInfo: ComicInfo): void {
  try {
    const zip = new AdmZip(archivePath)
    const existingInfo = zip.getEntries().find(
      e => !e.isDirectory && e.entryName.toLowerCase().endsWith('comicinfo.xml')
    )
    if (existingInfo) return

    const builder = new XMLBuilder({ ignoreAttributes: false, attributeNamePrefix: '@_', format: true })
    const infoObj: Record<string, string> = {}
    if (comicInfo.series) infoObj.Series = comicInfo.series
    if (comicInfo.title) infoObj.Title = comicInfo.title
    if (comicInfo.author) infoObj.Writer = comicInfo.author
    if (comicInfo.artist) infoObj.Penciller = comicInfo.artist
    if (comicInfo.description) infoObj.Summary = comicInfo.description
    if (comicInfo.year) infoObj.Year = String(comicInfo.year)
    if (comicInfo.language) infoObj.LanguageISO = comicInfo.language
    if (comicInfo.tags && comicInfo.tags.length > 0) infoObj.Tags = comicInfo.tags.join(', ')
    if (comicInfo.categories && comicInfo.categories.length > 0) infoObj.Categories = comicInfo.categories.join(', ')
    if (comicInfo.publisher) infoObj.Publisher = comicInfo.publisher
    if (comicInfo.manga) infoObj.Manga = comicInfo.manga
    if (comicInfo.count) infoObj.Count = String(comicInfo.count)
    if (comicInfo.number) infoObj.Number = String(comicInfo.number)

    const xmlObj = { ComicInfo: infoObj }
    const xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n' + builder.build(xmlObj)
    zip.addFile('ComicInfo.xml', Buffer.from(xmlContent, 'utf-8'))
    zip.writeZip(archivePath)
  } catch (err) {
    console.error(`Failed to write ComicInfo.xml to ${archivePath}:`, err)
  }
}

async function extractComicInfoFromCbz(filePath: string): Promise<{title?: string; author?: string; series?: string; summary?: string; genre?: string; status?: string; pageCount?: number}> {
  try {
    const zip = new AdmZip(filePath)
    const comicInfoEntry = zip.getEntries().find(
      e => !e.isDirectory && e.entryName.toLowerCase().endsWith('comicinfo.xml')
    )
    if (comicInfoEntry) {
      const xmlContent = comicInfoEntry.getData().toString('utf-8')
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
      })
      const result = parser.parse(xmlContent)
      const info = result.ComicInfo || result.comicinfo || {}
      return {
        title: info.Title || info.title || undefined,
        author: info.Author || info.author || info.Writer || info.writer || undefined,
        series: info.Series || info.series || undefined,
        summary: info.Summary || info.summary || undefined,
        genre: info.Genre || info.genre || undefined,
        status: info.Status || info.status || undefined,
        pageCount: parseInt(info.PageCount || info.pageCount) || undefined,
      }
    }
  } catch {}
  return {}
}

function listArchiveImages(archivePath: string): string[] {
  try {
    const zip = new AdmZip(archivePath)
    return zip.getEntries()
      .filter(e => !e.isDirectory && isImageFile(e.entryName))
      .map(e => e.entryName)
      .sort(naturalSort)
  } catch {
    return []
  }
}

function listFolderImages(folderPath: string): string[] {
  try {
    return fs.readdirSync(folderPath)
      .filter(name => isImageFile(name))
      .sort(naturalSort)
  } catch {
    return []
  }
}

async function generateCover(comicPath: string, comicId: number, fileType: FileType): Promise<string | null> {
  try {
    let imageBuffer: Buffer | null = null

    if (fileType === 'folder') {
      const coverNames = ['cover.jpg', 'cover.jpeg', 'cover.png', 'cover.webp', 'Cover.jpg', 'Cover.jpeg', 'Cover.png', 'Cover.webp']
      for (const coverName of coverNames) {
        const coverPath = path.join(comicPath, coverName)
        if (fs.existsSync(coverPath)) {
          imageBuffer = fs.readFileSync(coverPath)
          break
        }
      }
      if (!imageBuffer) {
        const images = listFolderImages(comicPath)
        if (images.length > 0) {
          imageBuffer = fs.readFileSync(path.join(comicPath, images[0]))
        }
      }
      if (!imageBuffer) {
        const subEntries = fs.readdirSync(comicPath, { withFileTypes: true })
        const archives = subEntries
          .filter(e => e.isFile() && isComicArchive(e.name))
          .sort((a, b) => naturalSort(a.name, b.name))
        if (archives.length > 0) {
          const archivePath = path.join(comicPath, archives[0].name)
          imageBuffer = extractFirstImageFromArchive(archivePath)
        }
      }
    } else if (fileType === 'cbz' || fileType === 'zip') {
      const parentDir = path.dirname(comicPath)
      const coverNames = ['cover.jpg', 'cover.jpeg', 'cover.png', 'cover.webp', 'Cover.jpg', 'Cover.jpeg', 'Cover.png', 'Cover.webp']
      for (const coverName of coverNames) {
        const coverPath = path.join(parentDir, coverName)
        if (fs.existsSync(coverPath)) {
          imageBuffer = fs.readFileSync(coverPath)
          break
        }
      }
      if (!imageBuffer) {
        imageBuffer = extractFirstImageFromArchive(comicPath)
      }
    }

    if (!imageBuffer) return null

    if (!fs.existsSync(config.coversDir)) {
      fs.mkdirSync(config.coversDir, { recursive: true })
    }

    const coverPath = path.join(config.coversDir, `${comicId}.webp`)
    await sharp(imageBuffer)
      .resize(300, 450, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(coverPath)

    try {
      if (fileType === 'cbz' || fileType === 'zip') {
        const dir = path.dirname(comicPath)
        const destCoverPath = path.join(dir, 'cover.jpg')
        if (!fs.existsSync(destCoverPath) && imageBuffer) {
          fs.writeFileSync(destCoverPath, imageBuffer)
        }
      } else if (fileType === 'folder') {
        const destCoverPath = path.join(comicPath, 'cover.jpg')
        if (!fs.existsSync(destCoverPath) && imageBuffer) {
          fs.writeFileSync(destCoverPath, imageBuffer)
        }
      }
    } catch {}

    return coverPath
  } catch (err) {
    console.error(`Cover generation failed for comic ${comicId} (${comicPath}):`, err instanceof Error ? err.message : String(err))
    return null
  }
}

function extractFirstImageFromArchive(archivePath: string): Buffer | null {
  try {
    const zip = new AdmZip(archivePath)
    const entries = zip.getEntries()
    const coverEntry = entries.find(e =>
      !e.isDirectory && /^cover\.(jpg|jpeg|png|webp)$/i.test(path.basename(e.entryName))
    )
    if (coverEntry) return coverEntry.getData()

    const sortedEntries = entries
      .filter(e => !e.isDirectory && isImageFile(e.entryName))
      .sort((a, b) => naturalSort(a.entryName, b.entryName))
    if (sortedEntries.length > 0) return sortedEntries[0].getData()

    return null
  } catch {
    return null
  }
}

function getFileSize(itemPath: string): number {
  try {
    const stat = fs.statSync(itemPath)
    if (stat.isDirectory()) {
      let totalSize = 0
      const entries = fs.readdirSync(itemPath, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = path.join(itemPath, entry.name)
        if (entry.isFile()) {
          totalSize += fs.statSync(fullPath).size
        }
      }
      return totalSize
    }
    return stat.size
  } catch {
    return 0
  }
}

function determineChapters(comicPath: string, fileType: FileType): { filePath: string; title: string; volume: number | null; chapterNumber: number; sortOrder: number }[] {
  if (fileType === 'cbz' || fileType === 'zip' || fileType === 'cbr' || fileType === 'rar') {
    const title = sanitizeTitle(path.basename(comicPath))
    return [{
      filePath: comicPath,
      title,
      volume: null,
      chapterNumber: 1,
      sortOrder: 0,
    }]
  }

  if (fileType === 'folder') {
    const entries = fs.readdirSync(comicPath, { withFileTypes: true })

    const archiveFiles = entries
      .filter(e => e.isFile() && isComicArchive(e.name))
      .map(e => e.name)
      .sort(naturalSort)

    const subFolders = entries
      .filter(e => e.isDirectory())
      .filter(e => {
        const subPath = path.join(comicPath, e.name)
        const subEntries = fs.readdirSync(subPath)
        return subEntries.some(name => isImageFile(name))
      })
      .map(e => e.name)
      .sort(naturalSort)

    const directImages = entries
      .filter(e => e.isFile() && isImageFile(e.name))

    if (archiveFiles.length > 0 || subFolders.length > 0) {
      const chapterList: { filePath: string; title: string; volume: number | null; chapterNumber: number; sortOrder: number }[] = []
      let sortOrder = 0

      for (const name of subFolders) {
        chapterList.push({
          filePath: path.join(comicPath, name),
          title: sanitizeTitle(name),
          volume: null,
          chapterNumber: sortOrder + 1,
          sortOrder,
        })
        sortOrder++
      }

      for (const name of archiveFiles) {
        chapterList.push({
          filePath: path.join(comicPath, name),
          title: sanitizeTitle(name),
          volume: null,
          chapterNumber: sortOrder + 1,
          sortOrder,
        })
        sortOrder++
      }

      return chapterList
    }

    if (directImages.length > 0) {
      return [{
        filePath: comicPath,
        title: 'Chapter 1',
        volume: null,
        chapterNumber: 1,
        sortOrder: 0,
      }]
    }
  }

  return []
}

function countPages(filePath: string, fileType: FileType): number {
  const ext = path.extname(filePath).toLowerCase()

  if (ext === '.cbz' || ext === '.zip') {
    return listArchiveImages(filePath).length
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    return listFolderImages(filePath).length
  }

  return 0
}

async function ensureTag(name: string): Promise<number> {
  const [existing] = await db.select().from(schema.tags).where(eq(schema.tags.name, name))
  if (existing) return existing.id

  const [created] = await db.insert(schema.tags).values({ name }).returning()
  return created.id
}

async function ensureCategory(name: string): Promise<number> {
  const [existing] = await db.select().from(schema.categories).where(eq(schema.categories.name, name))
  if (existing) return existing.id

  const maxOrder = await db.select({ maxOrder: sql<number>`COALESCE(MAX(${schema.categories.order}), 0)` }).from(schema.categories)
  const result = await db.insert(schema.categories).values({ name, order: (maxOrder[0].maxOrder || 0) + 1 }).returning()
  return (result as any[])[0].id
}

interface ProcessItem {
  comicPath: string
  fileType: FileType
  title: string
  titleSort: string
  comicInfo: ComicInfo
  fileSize: number
  chapterList: { filePath: string; title: string; volume: number | null; chapterNumber: number; sortOrder: number }[]
  coverSource: { path: string; fileType: FileType }
}

export const scanService = {
  async scanLibrary(namingMode: string = 'folder'): Promise<ScanResult> {
    const result: ScanResult = { added: 0, updated: 0, removed: 0, errors: [] }

    try {
      if (!fs.existsSync(config.comicsDir)) {
        fs.mkdirSync(config.comicsDir, { recursive: true })
        return result
      }

      const existingComics = await db.select().from(comics)
      const existingPathMap = new Map(existingComics.map(c => [c.path, c]))

      const entries = fs.readdirSync(config.comicsDir, { withFileTypes: true })
      const scannedPaths = new Set<string>()

      const standaloneArchives: { name: string; fullPath: string }[] = []
      const directoryEntries: { name: string; fullPath: string }[] = []

      for (const entry of entries) {
        const fullPath = path.join(config.comicsDir, entry.name)

        if (entry.isFile() && isComicArchive(entry.name)) {
          standaloneArchives.push({ name: entry.name, fullPath })
        } else if (entry.isDirectory()) {
          const subEntries = fs.readdirSync(fullPath, { withFileTypes: true })
          const hasImages = subEntries.some(e => e.isFile() && isImageFile(e.name))
          const hasArchives = subEntries.some(e => e.isFile() && isComicArchive(e.name))
          const hasSubFolders = subEntries.some(e => e.isDirectory())

          if (hasImages || hasArchives || hasSubFolders) {
            directoryEntries.push({ name: entry.name, fullPath })
          }
        }
      }

      const archivesByParentDir = new Map<string, { name: string; fullPath: string }[]>()
      for (const archive of standaloneArchives) {
        const parentDir = path.dirname(archive.fullPath)
        if (!archivesByParentDir.has(parentDir)) {
          archivesByParentDir.set(parentDir, [])
        }
        archivesByParentDir.get(parentDir)!.push(archive)
      }

      const itemsToProcess: ProcessItem[] = []

      for (const [parentDir, archives] of archivesByParentDir) {
        if (archives.length > 1) {
          archives.sort((a, b) => naturalSort(a.name, b.name))

          const firstArchiveInfo = extractComicInfoFromArchive(archives[0].fullPath)
          const folderTitle = sanitizeTitle(path.basename(parentDir))
          const rawTitle = namingMode === 'metadata'
            ? (firstArchiveInfo.series || firstArchiveInfo.title || folderTitle)
            : folderTitle
          const title = cleanSeriesTitle(rawTitle)
          const titleSort = title.toLowerCase().replace(/^(the|a|an)\s+/i, '')
          const fileSize = archives.reduce((sum, a) => sum + getFileSize(a.fullPath), 0)

          const chapterList = archives.map((archive, index) => ({
            filePath: archive.fullPath,
            title: sanitizeTitle(archive.name),
            volume: null as number | null,
            chapterNumber: index + 1,
            sortOrder: index,
          }))

          const firstArchiveFileType = getFileType(archives[0].name)

          itemsToProcess.push({
            comicPath: parentDir,
            fileType: 'folder',
            title,
            titleSort,
            comicInfo: firstArchiveInfo,
            fileSize,
            chapterList,
            coverSource: { path: archives[0].fullPath, fileType: firstArchiveFileType },
          })
        } else {
          const archive = archives[0]
          const comicPath = archive.fullPath
          const fileType = getFileType(archive.name)
          const comicInfo = extractComicInfoFromArchive(comicPath)
          const fileTitle = sanitizeTitle(archive.name)

          let finalTitle = fileTitle
          if (fileType === 'cbz') {
            try {
              const cbzInfo = await extractComicInfoFromCbz(comicPath)
              if (cbzInfo.title || cbzInfo.series) {
                finalTitle = cbzInfo.title || cbzInfo.series || fileTitle
              }
            } catch {}
          }

          const rawTitle = namingMode === 'metadata'
            ? (comicInfo.series || comicInfo.title || finalTitle)
            : finalTitle
          const title = cleanSeriesTitle(rawTitle)
          const titleSort = title.toLowerCase().replace(/^(the|a|an)\s+/i, '')
          const fileSize = getFileSize(comicPath)
          const chapterList = determineChapters(comicPath, fileType)

          itemsToProcess.push({
            comicPath,
            fileType,
            title,
            titleSort,
            comicInfo,
            fileSize,
            chapterList,
            coverSource: { path: comicPath, fileType },
          })
        }
      }

      for (const dir of directoryEntries) {
        const comicPath = dir.fullPath
        const fileType: FileType = 'folder'
        const comicInfo = extractComicInfoFromFolder(comicPath)
        const folderTitle = sanitizeTitle(dir.name)
        const rawTitle = namingMode === 'metadata'
          ? (comicInfo.series || comicInfo.title || folderTitle)
          : folderTitle
        const title = cleanSeriesTitle(rawTitle)
        const titleSort = title.toLowerCase().replace(/^(the|a|an)\s+/i, '')
        const fileSize = getFileSize(comicPath)
        const chapterList = determineChapters(comicPath, fileType)

        itemsToProcess.push({
          comicPath,
          fileType,
          title,
          titleSort,
          comicInfo,
          fileSize,
          chapterList,
          coverSource: { path: comicPath, fileType },
        })
      }

      for (const item of itemsToProcess) {
        scannedPaths.add(item.comicPath)

        try {
          const existing = existingPathMap.get(item.comicPath)

          let totalPages = 0
          for (const ch of item.chapterList) {
            totalPages += countPages(ch.filePath, item.fileType)
          }

          if (existing) {
            const currentStat = fs.statSync(item.comicPath)
            const lastModified = currentStat.mtime.toISOString()
            const titleChanged = existing.title !== item.title
            const hasMetadata = item.comicInfo.author || item.comicInfo.artist || item.comicInfo.description || item.comicInfo.tags?.length || item.comicInfo.categories?.length || item.comicInfo.publisher
            const metadataMissing = !existing.author && !existing.artist && !existing.description

            if (lastModified > existing.updatedAt || titleChanged || (hasMetadata && metadataMissing)) {
              let desc = item.comicInfo.description || existing.description
              if (item.comicInfo.publisher && !desc?.includes(item.comicInfo.publisher)) {
                const pubLine = `Publisher: ${item.comicInfo.publisher}`
                desc = desc ? `${desc}\n${pubLine}` : pubLine
              }
              await db.update(comics).set({
                title: item.title,
                titleSort: item.titleSort,
                author: item.comicInfo.author || existing.author,
                artist: item.comicInfo.artist || existing.artist,
                description: desc,
                status: (item.comicInfo.status as 'ongoing' | 'completed' | 'unknown') || existing.status,
                year: item.comicInfo.year || existing.year,
                language: item.comicInfo.language || existing.language,
                pageCount: totalPages,
                fileSize: item.fileSize,
                updatedAt: new Date().toISOString(),
              }).where(eq(comics.id, existing.id))

              await db.delete(chapters).where(eq(chapters.comicId, existing.id))

              for (const ch of item.chapterList) {
                const pageCount = countPages(ch.filePath, item.fileType)
                await db.insert(chapters).values({
                  comicId: existing.id,
                  volume: ch.volume,
                  chapterNumber: ch.chapterNumber,
                  title: ch.title,
                  pageCount,
                  filePath: ch.filePath,
                  sortOrder: ch.sortOrder,
                })
              }

              const coverPath = await generateCover(item.coverSource.path, existing.id, item.coverSource.fileType)
              if (coverPath) {
                await db.update(comics).set({ coverPath }).where(eq(comics.id, existing.id))
              }

              if (item.fileType === 'folder') {
                writeComicInfoToFolder(item.comicPath, item.comicInfo)
              } else if (item.fileType === 'cbz' || item.fileType === 'zip') {
                ensureComicInfoInArchive(item.comicPath, item.comicInfo)
              }

              result.updated++
            }
          } else {
            let desc = item.comicInfo.description || null
            if (item.comicInfo.publisher && (!desc || !desc.includes(item.comicInfo.publisher))) {
              const pubLine = `Publisher: ${item.comicInfo.publisher}`
              desc = desc ? `${desc}\n${pubLine}` : pubLine
            }
            const [inserted] = await db.insert(comics).values({
              title: item.title,
              titleSort: item.titleSort,
              author: item.comicInfo.author || null,
              artist: item.comicInfo.artist || null,
              description: desc,
              status: (item.comicInfo.status as 'ongoing' | 'completed' | 'unknown') || 'unknown',
              year: item.comicInfo.year || null,
              language: item.comicInfo.language || null,
              path: item.comicPath,
              fileType: item.fileType,
              pageCount: totalPages,
              fileSize: item.fileSize,
            }).returning()

            const comicId = inserted.id

            for (const ch of item.chapterList) {
              const pageCount = countPages(ch.filePath, item.fileType)
              await db.insert(chapters).values({
                comicId,
                volume: ch.volume,
                chapterNumber: ch.chapterNumber,
                title: ch.title,
                pageCount,
                filePath: ch.filePath,
                sortOrder: ch.sortOrder,
              })
            }

            if (item.comicInfo.tags && item.comicInfo.tags.length > 0) {
              for (const tagName of item.comicInfo.tags) {
                const tagId = await ensureTag(tagName)
                await db.insert(comicTags).values({ comicId, tagId })
              }
            }

            if (item.comicInfo.categories && item.comicInfo.categories.length > 0) {
              for (const catName of item.comicInfo.categories) {
                const categoryId = await ensureCategory(catName)
                await db.insert(comicCategories).values({ comicId, categoryId })
              }
            }

            const coverPath = await generateCover(item.coverSource.path, comicId, item.coverSource.fileType)
            if (coverPath) {
              await db.update(comics).set({ coverPath }).where(eq(comics.id, comicId))
            }

            if (item.fileType === 'folder') {
              writeComicInfoToFolder(item.comicPath, item.comicInfo)
            } else if (item.fileType === 'cbz' || item.fileType === 'zip') {
              ensureComicInfoInArchive(item.comicPath, item.comicInfo)
            }

            result.added++
          }
        } catch (err) {
          result.errors.push(`Error processing ${item.comicPath}: ${err instanceof Error ? err.message : String(err)}`)
        }
      }

      for (const [comicPath, comic] of existingPathMap) {
        if (!scannedPaths.has(comicPath)) {
          await db.delete(comics).where(eq(comics.id, comic.id))
          result.removed++
        }
      }
    } catch (err) {
      result.errors.push(`Scan error: ${err instanceof Error ? err.message : String(err)}`)
    }

    return result
  },

  async updateComicInfo(comicId: number, data: { title?: string; author?: string; artist?: string; description?: string; status?: string; year?: number; tags?: string[]; categories?: string[] }): Promise<void> {
    const [comic] = await db.select().from(comics).where(eq(comics.id, comicId))
    if (!comic) throw new Error('Comic not found')

    const chapterList = await db.select().from(chapters).where(eq(chapters.comicId, comicId))

    for (const chapter of chapterList) {
      const filePath = chapter.filePath
      if (!filePath) continue
      const ext = path.extname(filePath).toLowerCase()

      if (ext === '.cbz' || ext === '.zip') {
        try {
          const zip = new AdmZip(filePath)

          const existingInfo = zip.getEntries().find(
            e => !e.isDirectory && e.entryName.toLowerCase().endsWith('comicinfo.xml')
          )

          let xmlContent: string
          if (existingInfo) {
            xmlContent = existingInfo.getData().toString('utf-8')
          } else {
            xmlContent = '<?xml version="1.0" encoding="utf-8"?>\n<ComicInfo>\n</ComicInfo>'
          }

          const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' })
          const builder = new XMLBuilder({ ignoreAttributes: false, attributeNamePrefix: '@_', format: true })

          const parsed = parser.parse(xmlContent)
          const info = parsed.ComicInfo || parsed.comicinfo || {}

          if (data.title !== undefined) info.Title = data.title
          if (data.author !== undefined) info.Writer = data.author
          if (data.artist !== undefined) info.Penciller = data.artist
          if (data.description !== undefined) info.Summary = data.description
          if (data.status !== undefined) {
            const statusMap: Record<string, string> = { ongoing: 'Ongoing', completed: 'Completed', unknown: 'Unknown' }
            info.PublishingStatus = statusMap[data.status] || data.status
          }
          if (data.year !== undefined) info.Year = String(data.year)
          if (data.tags !== undefined) info.Tags = data.tags.join(', ')
          if (data.categories !== undefined) info.Categories = data.categories.join(', ')

          parsed.ComicInfo = info
          const newXml = builder.build(parsed)

          if (existingInfo) {
            zip.updateFile(existingInfo, Buffer.from(newXml, 'utf-8'))
          } else {
            zip.addFile('ComicInfo.xml', Buffer.from(newXml, 'utf-8'))
          }

          zip.writeZip(filePath)
        } catch (err) {
          console.error(`Failed to update ComicInfo.xml in ${filePath}:`, err)
        }
      }
    }
  },
}
