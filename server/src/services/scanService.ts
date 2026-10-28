import fs from 'fs'
import path from 'path'
import AdmZip from 'adm-zip'
import sharp from 'sharp'
import { XMLParser } from 'fast-xml-parser'
import { eq, sql } from 'drizzle-orm'
import { db, schema } from '@/db/index.js'
import config from '@/config/index.js'
import type { ScanResult, FileType } from '@/types/index.js'
import { isImageFile, isComicArchive, getFileType, naturalSort } from '@/utils/index.js'
import { listRarImages, readRarImage } from './rarUtils.js'

const { comics, chapters, comicCategories, comicTags, readingProgress } = schema

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
  publisher?: string
  count?: number
  number?: number
  bookId?: string
  ageRating?: string
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
      publisher: info.Publisher || info.publisher || undefined,
      count: countVal,
      number: numberVal,
      bookId: String(info.BookId || info.BookID || info.bookId || '') || undefined,
      ageRating: info.AgeRating || info.ageRating || undefined,
    }
  } catch {
    return {}
  }
}

function parseListField(value: string | undefined): string[] | undefined {
  if (!value) return undefined
  return String(value).split(/[,;|]/).map(s => s.trim()).filter(Boolean)
}

// 只从 CBZ/ZIP 归档内部读取 ComicInfo.xml，不再读取/创建文件夹级 ComicInfo.xml
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

/**
 * 解析漫画文件名规则：[作者]漫画名[_N].cbz
 * - 作者 = 文件名第一个 [] 内的内容
 * - 漫画名 = 第一个 [] 之后的部分（不含 []），去掉章节后缀 _N
 * - _N 后缀 = 第 N 话（无后缀为第 1 话）
 */
export function parseComicFileName(filename: string): { author?: string; baseName: string; chapterNum: number } {
  let name = path.basename(filename)
  const ext = path.extname(name)
  if (ext) name = name.slice(0, -ext.length)

  let author: string | undefined
  const authorMatch = name.match(/^\[([^\]]*)\]\s*/)
  if (authorMatch) {
    author = authorMatch[1]!.trim() || undefined
    name = name.slice(authorMatch[0].length)
  }

  let chapterNum = 1
  const chapterMatch = name.match(/^(.*?)\s*[_\-]\s*(\d+)$/)
  if (chapterMatch && chapterMatch[1]) {
    chapterNum = parseInt(chapterMatch[2]!, 10) || 1
    name = chapterMatch[1]!
  }

  name = name.replace(/\s+/g, ' ').trim()
  if (!name) name = path.basename(filename, ext)
  return { author, baseName: name, chapterNum }
}

// 漫画分组键：同一目录下 作者+漫画名 相同的归档归为一部漫画
function groupKeyOf(parentDir: string, author: string | undefined, baseName: string): string {
  return `${path.resolve(parentDir)}|${(author || '').toLowerCase()}|${baseName.toLowerCase()}`
}

// 合成漫画路径（不一定真实存在，作为 DB 唯一标识）：目录/[作者]漫画名
function syntheticComicPath(parentDir: string, author: string | undefined, baseName: string): string {
  return path.join(parentDir, author ? `[${author}]${baseName}` : baseName)
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
      const images = listFolderImages(comicPath)
      if (images.length > 0) {
        imageBuffer = fs.readFileSync(path.join(comicPath, images[0]!))
      }
    } else if (fileType === 'cbz' || fileType === 'zip' || fileType === 'cbr' || fileType === 'rar') {
      imageBuffer = await extractFirstImageFromArchive(comicPath)
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

    return coverPath
  } catch (err) {
    console.error(`Cover generation failed for comic ${comicId} (${comicPath}):`, err instanceof Error ? err.message : String(err))
    return null
  }
}

async function extractFirstImageFromArchive(archivePath: string): Promise<Buffer | null> {
  const ext = path.extname(archivePath).toLowerCase()
  if (ext === '.cbr' || ext === '.rar') {
    const names = await listRarImages(archivePath)
    if (names.length === 0) return null
    return readRarImage(archivePath, names[0]!)
  }
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
    if (sortedEntries.length > 0) return sortedEntries[0]!.getData()

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

async function countPages(filePath: string): Promise<number> {
  const ext = path.extname(filePath).toLowerCase()

  if (ext === '.cbz' || ext === '.zip') {
    return listArchiveImages(filePath).length
  }

  if (ext === '.cbr' || ext === '.rar') {
    return (await listRarImages(filePath)).length
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    return listFolderImages(filePath).length
  }

  return 0
}

// 只查找标签管理中已存在的标签，不自动创建——CBZ 里的杂标签不入库，
// 只有标签管理（分类与标签页）中存在的标签才会被保留、显示并写回 CBZ
async function findTagId(name: string): Promise<number | null> {
  const [existing] = await db.select().from(schema.tags).where(eq(schema.tags.name, name))
  return existing ? existing.id : null
}

async function ensureCategory(name: string): Promise<number> {
  const [existing] = await db.select().from(schema.categories).where(eq(schema.categories.name, name))
  if (existing) return existing.id

  const maxOrder = await db.select({ maxOrder: sql<number>`COALESCE(MAX(${schema.categories.order}), 0)` }).from(schema.categories)
  const result = await db.insert(schema.categories).values({ name, order: (maxOrder[0]!.maxOrder || 0) + 1 }).returning()
  return (result as any[])[0].id
}

interface ChapterSpec {
  filePath: string
  title: string
  chapterNumber: number
  sortOrder: number
}

interface ProcessItem {
  comicPath: string
  fileType: FileType
  title: string
  titleSort: string
  author: string | null
  comicInfo: ComicInfo
  fileSize: number
  chapterList: ChapterSpec[]
  coverSource: { path: string; fileType: FileType }
  latestMtime: string | null
}

// 扫描进度（模块级状态，供 /api/comics/scan/status 轮询返回）
export const scanProgress = {
  phase: 'idle' as 'idle' | 'preparing' | 'processing' | 'done',
  total: 0,
  processed: 0,
  current: '',
}

function makeTitleSort(title: string): string {
  return title.toLowerCase().replace(/^(the|a|an)\s+/i, '')
}

export const scanService = {
  /**
   * 扫描漫画库。scope 为 'all' 时扫描整个 comicsDir；否则只扫描 comicsDir 下指定的子文件夹
   * （如 comics/1）。选择单个子文件夹时，其它子文件夹的漫画不做任何增删改。
   *
   * 文件组织规则（新）：
   *   存储位置/1/[作者]漫画名.cbz      → 漫画《漫画名》第 1 话
   *   存储位置/1/[作者]漫画名_2.cbz    → 第 2 话，归入《漫画名》
   *   直接包含图片的文件夹              → 单章节漫画（第 1 话）
   */
  async scanLibrary(scope: string = 'all'): Promise<ScanResult> {
    const result: ScanResult = { added: 0, updated: 0, removed: 0, errors: [] }

    scanProgress.phase = 'preparing'
    scanProgress.total = 0
    scanProgress.processed = 0
    scanProgress.current = ''

    // 防路径穿越：scope 必须是单个文件夹名
    const scoped = scope && scope !== 'all'
    if (scoped && (scope.includes('/') || scope.includes('\\') || scope === '.' || scope === '..')) {
      result.errors.push(`Invalid scan scope: ${scope}`)
      scanProgress.phase = 'done'
      return result
    }

    const scanRoot = scoped ? path.resolve(config.comicsDir, scope) : path.resolve(config.comicsDir)

    try {
      if (!fs.existsSync(scanRoot)) {
        fs.mkdirSync(scanRoot, { recursive: true })
        scanProgress.phase = 'done'
        return result
      }

      const existingComics = await db.select().from(comics)
      const existingPathMap = new Map(existingComics.map(c => [path.resolve(c.path), c]))

      // 只处理当前扫描范围内的已有漫画：scope 为单个子文件夹时，其它子文件夹的记录一律不动
      if (scoped) {
        const prefix = scanRoot + path.sep
        for (const p of [...existingPathMap.keys()]) {
          if (p !== scanRoot && !p.startsWith(prefix)) {
            existingPathMap.delete(p)
          }
        }
      }

      // 标题+作者 索引：旧结构（文件夹漫画）重扫成新结构时按标题复用记录，保留评分/进度/收藏
      const normTitle = (t: string) => t.replace(/^\[[^\]]*\]\s*/, '').trim().toLowerCase()
      const existingByTitleAuthor = new Map<string, typeof existingComics[number]>()
      for (const c of existingPathMap.values()) {
        const key = `${normTitle(c.title)}|${(c.author || '').toLowerCase()}`
        if (!existingByTitleAuthor.has(key)) existingByTitleAuthor.set(key, c)
        if (!c.author) {
          const keyNoAuthor = `${normTitle(c.title)}|`
          if (!existingByTitleAuthor.has(keyNoAuthor)) existingByTitleAuthor.set(keyNoAuthor, c)
        }
      }

      const findExisting = (comicPath: string, title: string, author: string | null) =>
        existingPathMap.get(path.resolve(comicPath))
          || existingByTitleAuthor.get(`${normTitle(title)}|${(author || '').toLowerCase()}`)
          || (!author ? existingByTitleAuthor.get(`${normTitle(title)}|`) : undefined)

      // ---- 收集扫描条目 ----
      // 归档文件按 (目录, 作者, 漫画名) 分组；直接含图片的文件夹为单章节漫画
      const archiveFiles: { name: string; fullPath: string; parentDir: string }[] = []
      const imageFolders: { name: string; fullPath: string }[] = []

      const collect = (dir: string, depth: number) => {
        let entries: fs.Dirent[]
        try {
          entries = fs.readdirSync(dir, { withFileTypes: true })
        } catch {
          return
        }
        for (const entry of entries) {
          const fullPath = path.resolve(path.join(dir, entry.name))
          if (entry.isFile() && isComicArchive(entry.name)) {
            archiveFiles.push({ name: entry.name, fullPath, parentDir: dir })
          } else if (entry.isDirectory()) {
            let subEntries: fs.Dirent[] = []
            try {
              subEntries = fs.readdirSync(fullPath, { withFileTypes: true })
            } catch { continue }
            const hasImages = subEntries.some(e => e.isFile() && isImageFile(e.name))
            const hasArchives = subEntries.some(e => e.isFile() && isComicArchive(e.name))
            const hasSubFolders = subEntries.some(e => e.isDirectory())

            if (hasImages) {
              // 直接包含图片的文件夹 = 一部单章节漫画
              imageFolders.push({ name: entry.name, fullPath })
            } else if (hasArchives) {
              // 文件夹内的归档同样按扁平规则分组（[作者]名[_N]）
              collectArchivesOnly(fullPath)
            } else if (hasSubFolders && depth < 2) {
              // 集合文件夹（如序号目录）：递归展开
              collect(fullPath, depth + 1)
            }
          }
        }
      }

      const collectArchivesOnly = (dir: string) => {
        let entries: fs.Dirent[] = []
        try {
          entries = fs.readdirSync(dir, { withFileTypes: true })
        } catch { return }
        for (const entry of entries) {
          const fullPath = path.resolve(path.join(dir, entry.name))
          if (entry.isFile() && isComicArchive(entry.name)) {
            archiveFiles.push({ name: entry.name, fullPath, parentDir: dir })
          }
        }
      }

      collect(scanRoot, 0)

      // ---- 归档按 [作者]漫画名 分组 ----
      const groups = new Map<string, { parentDir: string; author?: string; baseName: string; files: { name: string; fullPath: string; chapterNum: number }[] }>()
      for (const file of archiveFiles) {
        const parsed = parseComicFileName(file.name)
        const key = groupKeyOf(file.parentDir, parsed.author, parsed.baseName)
        if (!groups.has(key)) {
          groups.set(key, { parentDir: file.parentDir, author: parsed.author, baseName: parsed.baseName, files: [] })
        }
        groups.get(key)!.files.push({ name: file.name, fullPath: file.fullPath, chapterNum: parsed.chapterNum })
      }

      const itemsToProcess: ProcessItem[] = []
      const scannedPaths = new Set<string>()
      let skippedUnchanged = 0

      const computeLatestMtime = (paths: string[]): string | null => {
        let latest: string | null = null
        for (const p of paths) {
          try {
            const m = fs.statSync(p).mtime.toISOString()
            if (!latest || m > latest) latest = m
          } catch {}
        }
        return latest
      }

      for (const group of groups.values()) {
        group.files.sort((a, b) => a.chapterNum - b.chapterNum || naturalSort(a.name, b.name))
        const comicPath = syntheticComicPath(group.parentDir, group.author, group.baseName)
        const existing = findExisting(comicPath, group.baseName, group.author || null)

        const chapterPaths = group.files.map(f => f.fullPath)
        const latestMtime = computeLatestMtime(chapterPaths)

        if (existing) {
          scannedPaths.add(path.resolve(existing.path))
          const existingChapterCount = (await db.select({ count: sql<number>`count(*)` }).from(chapters).where(eq(chapters.comicId, existing.id)))[0]!.count
          if (latestMtime && latestMtime <= existing.updatedAt && existingChapterCount === group.files.length) {
            skippedUnchanged++
            scannedPaths.add(path.resolve(comicPath))
            continue
          }
        }

        const firstFile = group.files[0]!
        const fileType = getFileType(firstFile.name)
        const comicInfo = extractComicInfoFromArchive(firstFile.fullPath)
        const title = group.baseName
        const fileSize = chapterPaths.reduce((sum, p) => sum + getFileSize(p), 0)

        const chapterList: ChapterSpec[] = group.files.map((f, idx) => ({
          filePath: f.fullPath,
          title: `第${f.chapterNum}话`,
          chapterNumber: f.chapterNum,
          sortOrder: idx,
        }))

        itemsToProcess.push({
          comicPath,
          fileType,
          title,
          titleSort: makeTitleSort(title),
          author: group.author || null,
          comicInfo,
          fileSize,
          chapterList,
          coverSource: { path: firstFile.fullPath, fileType },
          latestMtime,
        })
      }

      // ---- 图片文件夹（单章节漫画） ----
      for (const dir of imageFolders) {
        const comicPath = dir.fullPath
        const parsed = parseComicFileName(dir.name)
        const existing = findExisting(comicPath, parsed.baseName, parsed.author || null)

        const latestMtime = computeLatestMtime([comicPath])

        if (existing) {
          scannedPaths.add(path.resolve(existing.path))
          if (latestMtime && latestMtime <= existing.updatedAt) {
            skippedUnchanged++
            scannedPaths.add(path.resolve(comicPath))
            continue
          }
        }

        const title = parsed.baseName
        itemsToProcess.push({
          comicPath,
          fileType: 'folder',
          title,
          titleSort: makeTitleSort(title),
          author: parsed.author || null,
          comicInfo: {},
          fileSize: getFileSize(comicPath),
          chapterList: [{ filePath: comicPath, title: '第1话', chapterNumber: 1, sortOrder: 0 }],
          coverSource: { path: comicPath, fileType: 'folder' },
          latestMtime,
        })
      }

      if (skippedUnchanged > 0) {
        console.log(`[Scan] Skipped ${skippedUnchanged} unchanged comics`)
      }

      scanProgress.phase = 'processing'
      scanProgress.total = itemsToProcess.length
      scanProgress.processed = 0

      for (const item of itemsToProcess) {
        scanProgress.current = item.title
        scannedPaths.add(path.resolve(item.comicPath))

        try {
          const existing = findExisting(item.comicPath, item.title, item.author)

          let totalPages = 0
          for (const ch of item.chapterList) {
            totalPages += await countPages(ch.filePath)
          }

          if (existing) {
            scannedPaths.add(path.resolve(existing.path))

            // 保留阅读进度：重建章节前记录进度对应的章节号，重建后恢复
            const [progressRow] = await db.select().from(readingProgress).where(eq(readingProgress.comicId, existing.id))
            let savedProgress: { chapterNumber: number; currentPage: number; totalPages: number; isCompleted: boolean; lastReadAt: string; createdAt: string } | null = null
            if (progressRow) {
              const [oldChapter] = await db.select({ chapterNumber: chapters.chapterNumber }).from(chapters).where(eq(chapters.id, progressRow.chapterId))
              if (oldChapter) {
                savedProgress = {
                  chapterNumber: oldChapter.chapterNumber,
                  currentPage: progressRow.currentPage,
                  totalPages: progressRow.totalPages,
                  isCompleted: progressRow.isCompleted,
                  lastReadAt: progressRow.lastReadAt,
                  createdAt: progressRow.createdAt,
                }
              }
            }

            await db.update(comics).set({
              title: item.title,
              titleSort: item.titleSort,
              author: item.author || existing.author,
              path: item.comicPath,
              fileType: item.fileType,
              artist: existing.artist || item.comicInfo.artist || null,
              description: existing.description || item.comicInfo.description || null,
              status: existing.status !== 'unknown' ? existing.status : ((item.comicInfo.status as 'ongoing' | 'completed' | 'unknown') || 'unknown'),
              year: existing.year || item.comicInfo.year || null,
              language: existing.language || item.comicInfo.language || null,
              bookId: existing.bookId || item.comicInfo.bookId || null,
              ageRating: existing.ageRating || item.comicInfo.ageRating || null,
              pageCount: totalPages,
              fileSize: item.fileSize,
              updatedAt: new Date().toISOString(),
            }).where(eq(comics.id, existing.id))

            await db.delete(chapters).where(eq(chapters.comicId, existing.id))

            const newChapterIds = new Map<number, number>()
            for (const ch of item.chapterList) {
              const pageCount = await countPages(ch.filePath)
              const [inserted] = await db.insert(chapters).values({
                comicId: existing.id,
                volume: null,
                chapterNumber: ch.chapterNumber,
                title: ch.title,
                pageCount,
                filePath: ch.filePath,
                sortOrder: ch.sortOrder,
              }).returning()
              newChapterIds.set(ch.chapterNumber, inserted.id)
            }

            // 恢复阅读进度到同名章节
            if (savedProgress) {
              const newChapterId = newChapterIds.get(savedProgress.chapterNumber) ?? newChapterIds.get(1)
              if (newChapterId) {
                await db.delete(readingProgress).where(eq(readingProgress.comicId, existing.id))
                await db.insert(readingProgress).values({
                  comicId: existing.id,
                  chapterId: newChapterId,
                  currentPage: savedProgress.currentPage,
                  totalPages: savedProgress.totalPages,
                  isCompleted: savedProgress.isCompleted,
                  lastReadAt: savedProgress.lastReadAt,
                  createdAt: savedProgress.createdAt,
                  updatedAt: new Date().toISOString(),
                })
              }
            }

            const coverPath = await generateCover(item.coverSource.path, existing.id, item.coverSource.fileType)
            if (coverPath) {
              await db.update(comics).set({ coverPath }).where(eq(comics.id, existing.id))
            }

            result.updated++
          } else {
            let desc = item.comicInfo.description || null
            if (item.comicInfo.publisher && (!desc || !desc.includes(item.comicInfo.publisher))) {
              const pubLine = `Publisher: ${item.comicInfo.publisher}`
              desc = desc ? `${desc}\n${pubLine}` : pubLine
            }
            const [inserted] = await db.insert(comics).values({
              title: item.title,
              titleSort: item.titleSort,
              author: item.author || item.comicInfo.author || null,
              artist: item.comicInfo.artist || null,
              description: desc,
              status: (item.comicInfo.status as 'ongoing' | 'completed' | 'unknown') || 'unknown',
              year: item.comicInfo.year || null,
              language: item.comicInfo.language || null,
              bookId: item.comicInfo.bookId || null,
              ageRating: item.comicInfo.ageRating || null,
              path: item.comicPath,
              fileType: item.fileType,
              pageCount: totalPages,
              fileSize: item.fileSize,
            }).returning()

            const comicId = inserted.id

            for (const ch of item.chapterList) {
              const pageCount = await countPages(ch.filePath)
              await db.insert(chapters).values({
                comicId,
                volume: null,
                chapterNumber: ch.chapterNumber,
                title: ch.title,
                pageCount,
                filePath: ch.filePath,
                sortOrder: ch.sortOrder,
              })
            }

            if (item.comicInfo.tags && item.comicInfo.tags.length > 0) {
              for (const tagName of item.comicInfo.tags) {
                const tagId = await findTagId(tagName)
                if (tagId !== null) {
                  await db.insert(comicTags).values({ comicId, tagId })
                }
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

            result.added++
          }
        } catch (err) {
          result.errors.push(`Error processing ${item.comicPath}: ${err instanceof Error ? err.message : String(err)}`)
        }

        scanProgress.processed++
      }

      scanProgress.phase = 'done'
      scanProgress.current = ''

      // 仅删除当前扫描范围内、本次未扫到的记录
      for (const [comicPath, comic] of existingPathMap) {
        if (!scannedPaths.has(comicPath)) {
          await db.delete(comics).where(eq(comics.id, comic.id))
          result.removed++
        }
      }
    } catch (err) {
      result.errors.push(`Scan error: ${err instanceof Error ? err.message : String(err)}`)
      scanProgress.phase = 'done'
    }

    return result
  },

  async refreshComic(comicId: number): Promise<{ updated: boolean; added: number; removed: number }> {
    const [comic] = await db.select().from(comics).where(eq(comics.id, comicId))
    if (!comic) throw new Error('Comic not found')

    const fileType = comic.fileType as FileType

    // 图片文件夹漫画：直接重新统计
    if (fileType === 'folder' && fs.existsSync(comic.path) && fs.statSync(comic.path).isDirectory()) {
      const currentStat = fs.statSync(comic.path)
      if (currentStat.mtime.toISOString() <= comic.updatedAt) {
        return { updated: false, added: 0, removed: 0 }
      }
      const pageCount = listFolderImages(comic.path).length
      await db.update(chapters).set({ pageCount, updatedAt: new Date().toISOString() })
        .where(eq(chapters.comicId, comicId))
      await db.update(comics).set({
        pageCount,
        fileSize: getFileSize(comic.path),
        updatedAt: new Date().toISOString(),
      }).where(eq(comics.id, comicId))
      return { updated: true, added: 0, removed: 0 }
    }

    // 扁平归档漫画：根据第 1 话路径找到同组所有章节文件
    const comicChapters = await db.select().from(chapters).where(eq(chapters.comicId, comicId))
      .orderBy(chapters.sortOrder)
    const firstChapter = comicChapters[0]
    if (!firstChapter || !fs.existsSync(firstChapter.filePath)) {
      return { updated: false, added: 0, removed: 0 }
    }

    const parentDir = path.dirname(firstChapter.filePath)
    const parsedFirst = parseComicFileName(path.basename(firstChapter.filePath))
    const groupKey = groupKeyOf(parentDir, parsedFirst.author, parsedFirst.baseName)

    let dirEntries: fs.Dirent[] = []
    try {
      dirEntries = fs.readdirSync(parentDir, { withFileTypes: true })
    } catch {
      return { updated: false, added: 0, removed: 0 }
    }

    const groupFiles: { name: string; fullPath: string; chapterNum: number }[] = []
    for (const entry of dirEntries) {
      if (!entry.isFile() || !isComicArchive(entry.name)) continue
      const parsed = parseComicFileName(entry.name)
      if (groupKeyOf(parentDir, parsed.author, parsed.baseName) === groupKey) {
        groupFiles.push({ name: entry.name, fullPath: path.join(parentDir, entry.name), chapterNum: parsed.chapterNum })
      }
    }
    groupFiles.sort((a, b) => a.chapterNum - b.chapterNum || naturalSort(a.name, b.name))

    // 未变更判断：所有章节文件 mtime 都不晚于 updatedAt 且章节数一致
    let latestMtime: string | null = null
    for (const f of groupFiles) {
      try {
        const m = fs.statSync(f.fullPath).mtime.toISOString()
        if (!latestMtime || m > latestMtime) latestMtime = m
      } catch {}
    }
    if (latestMtime && latestMtime <= comic.updatedAt && groupFiles.length === comicChapters.length) {
      return { updated: false, added: 0, removed: 0 }
    }

    const oldPaths = new Set(comicChapters.map(c => c.filePath))
    const newPaths = new Set(groupFiles.map(f => f.fullPath))
    let added = 0
    let removed = 0
    for (const p of newPaths) if (!oldPaths.has(p)) added++
    for (const p of oldPaths) if (!newPaths.has(p)) removed++

    // 保留阅读进度
    const [progressRow] = await db.select().from(readingProgress).where(eq(readingProgress.comicId, comicId))
    let savedProgress: { chapterNumber: number; currentPage: number; totalPages: number; isCompleted: boolean; lastReadAt: string; createdAt: string } | null = null
    if (progressRow) {
      const oldCh = comicChapters.find(c => c.id === progressRow.chapterId)
      if (oldCh) {
        savedProgress = {
          chapterNumber: oldCh.chapterNumber,
          currentPage: progressRow.currentPage,
          totalPages: progressRow.totalPages,
          isCompleted: progressRow.isCompleted,
          lastReadAt: progressRow.lastReadAt,
          createdAt: progressRow.createdAt,
        }
      }
    }

    await db.delete(chapters).where(eq(chapters.comicId, comicId))

    let totalPages = 0
    const newChapterIds = new Map<number, number>()
    for (let i = 0; i < groupFiles.length; i++) {
      const f = groupFiles[i]!
      const pageCount = await countPages(f.fullPath)
      totalPages += pageCount
      const [inserted] = await db.insert(chapters).values({
        comicId,
        volume: null,
        chapterNumber: f.chapterNum,
        title: `第${f.chapterNum}话`,
        pageCount,
        filePath: f.fullPath,
        sortOrder: i,
      }).returning()
      newChapterIds.set(f.chapterNum, inserted.id)
    }

    if (savedProgress) {
      const newChapterId = newChapterIds.get(savedProgress.chapterNumber) ?? newChapterIds.get(1)
      if (newChapterId) {
        await db.delete(readingProgress).where(eq(readingProgress.comicId, comicId))
        await db.insert(readingProgress).values({
          comicId,
          chapterId: newChapterId,
          currentPage: savedProgress.currentPage,
          totalPages: savedProgress.totalPages,
          isCompleted: savedProgress.isCompleted,
          lastReadAt: savedProgress.lastReadAt,
          createdAt: savedProgress.createdAt,
          updatedAt: new Date().toISOString(),
        })
      }
    }

    const fileSize = groupFiles.reduce((sum, f) => sum + getFileSize(f.fullPath), 0)
    await db.update(comics).set({
      pageCount: totalPages,
      fileSize,
      updatedAt: new Date().toISOString(),
    }).where(eq(comics.id, comicId))

    if (groupFiles.length > 0) {
      const coverPath = await generateCover(groupFiles[0]!.fullPath, comicId, getFileType(groupFiles[0]!.name))
      if (coverPath) {
        await db.update(comics).set({ coverPath }).where(eq(comics.id, comicId))
      }
    }

    return { updated: true, added, removed }
  },
}
