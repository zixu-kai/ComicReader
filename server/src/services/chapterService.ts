import { eq, asc } from 'drizzle-orm'
import { db, schema } from '@/db/index.js'
import type { Chapter } from '@/types/index.js'
import AdmZip from 'adm-zip'
import fs from 'fs'
import path from 'path'
import { isImageFile, naturalSort } from '@/utils/index.js'

const { chapters, comics } = schema

const chapterBackups = new Map<number, string>()

interface PageOperation {
  type: 'original' | 'new'
  index?: number
  fileKey?: string
}

export const chapterService = {
  async getChapters(comicId: number): Promise<Chapter[]> {
    return db.select().from(chapters)
      .where(eq(chapters.comicId, comicId))
      .orderBy(asc(chapters.sortOrder)) as Promise<Chapter[]>
  },

  async getChapterPages(chapterId: number): Promise<string[]> {
    const [chapter] = await db.select().from(chapters).where(eq(chapters.id, chapterId))
    if (!chapter) return []

    const [comic] = await db.select().from(comics).where(eq(comics.id, chapter.comicId))
    if (!comic) return []

    const imageNames = this.listChapterImages(chapter.filePath, comic.fileType)
    return imageNames.map((name, index) => `/api/chapters/${chapterId}/pages/${index + 1}`)
  },

  async getPageImage(chapterId: number, pageNum: number): Promise<Buffer | null> {
    const [chapter] = await db.select().from(chapters).where(eq(chapters.id, chapterId))
    if (!chapter) return null

    const [comic] = await db.select().from(comics).where(eq(comics.id, chapter.comicId))
    if (!comic) return null

    const filePath = chapter.filePath
    const ext = path.extname(filePath).toLowerCase()

    if (ext === '.cbz' || ext === '.zip') {
      return this.readFromArchive(filePath, pageNum)
    }

    if (ext === '.cbr' || ext === '.rar') {
      return this.readFromArchive(filePath, pageNum)
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      return this.readFromFolder(filePath, pageNum)
    }

    if (comic.fileType === 'folder') {
      return this.readFromFolder(filePath, pageNum)
    }

    return null
  },

  listChapterImages(filePath: string, fileType: string): string[] {
    const ext = path.extname(filePath).toLowerCase()

    if (ext === '.cbz' || ext === '.zip') {
      try {
        const zip = new AdmZip(filePath)
        const entries = zip.getEntries()
        const imageEntries = entries
          .filter(e => !e.isDirectory && isImageFile(e.entryName))
          .map(e => e.entryName)
          .sort(naturalSort)
        return imageEntries
      } catch {
        return []
      }
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      try {
        return fs.readdirSync(filePath)
          .filter(name => isImageFile(name))
          .sort(naturalSort)
      } catch {
        return []
      }
    }

    return []
  },

  readFromArchive(archivePath: string, pageNum: number): Buffer | null {
    try {
      const zip = new AdmZip(archivePath)
      const entries = zip.getEntries()
      const imageEntries = entries
        .filter(e => !e.isDirectory && isImageFile(e.entryName))
        .sort((a, b) => naturalSort(a.entryName, b.entryName))

      if (pageNum < 1 || pageNum > imageEntries.length) return null

      const entry = imageEntries[pageNum - 1]
      return entry.getData()
    } catch {
      return null
    }
  },

  readFromFolder(folderPath: string, pageNum: number): Buffer | null {
    try {
      const files = fs.readdirSync(folderPath)
        .filter(name => isImageFile(name))
        .sort(naturalSort)

      if (pageNum < 1 || pageNum > files.length) return null

      const imagePath = path.join(folderPath, files[pageNum - 1])
      return fs.readFileSync(imagePath)
    } catch {
      return null
    }
  },

  async backupChapter(chapterId: number): Promise<string> {
    const [chapter] = await db.select().from(chapters).where(eq(chapters.id, chapterId))
    if (!chapter) throw new Error('Chapter not found')

    const filePath = chapter.filePath
    const ext = path.extname(filePath).toLowerCase()
    const backupDir = path.join(path.dirname(filePath), '.backups')

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    const backupPath = path.join(backupDir, `${chapterId}_${Date.now()}${ext}`)

    if (ext === '.cbz' || ext === '.zip') {
      fs.copyFileSync(filePath, backupPath)
    } else if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      fs.cpSync(filePath, backupPath, { recursive: true })
    } else {
      throw new Error('Unsupported chapter file type for backup')
    }

    chapterBackups.set(chapterId, backupPath)
    return backupPath
  },

  async commitChapterEdit(chapterId: number): Promise<void> {
    const backupPath = chapterBackups.get(chapterId)
    if (backupPath) {
      if (fs.existsSync(backupPath)) {
        const stat = fs.statSync(backupPath)
        if (stat.isDirectory()) {
          fs.rmSync(backupPath, { recursive: true, force: true })
        } else {
          fs.unlinkSync(backupPath)
        }
      }
      chapterBackups.delete(chapterId)
    }
  },

  async revertChapterEdit(chapterId: number): Promise<void> {
    const backupPath = chapterBackups.get(chapterId)
    if (!backupPath || !fs.existsSync(backupPath)) {
      throw new Error('No backup found for this chapter')
    }

    const [chapter] = await db.select().from(chapters).where(eq(chapters.id, chapterId))
    if (!chapter) throw new Error('Chapter not found')

    const filePath = chapter.filePath
    const ext = path.extname(filePath).toLowerCase()

    if (ext === '.cbz' || ext === '.zip') {
      fs.unlinkSync(filePath)
      fs.copyFileSync(backupPath, filePath)
    } else if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      const imageFiles = fs.readdirSync(filePath).filter(name => isImageFile(name))
      for (const name of imageFiles) {
        fs.unlinkSync(path.join(filePath, name))
      }
      const backupImages = fs.readdirSync(backupPath).filter(name => isImageFile(name))
      for (const name of backupImages) {
        fs.copyFileSync(path.join(backupPath, name), path.join(filePath, name))
      }
    }

    const stat = fs.statSync(backupPath)
    if (stat.isDirectory()) {
      fs.rmSync(backupPath, { recursive: true, force: true })
    } else {
      fs.unlinkSync(backupPath)
    }
    chapterBackups.delete(chapterId)

    const imageNames = this.listChapterImages(filePath, ext === '.cbz' || ext === '.zip' ? 'cbz' : 'folder')
    await db.update(chapters).set({
      pageCount: imageNames.length,
      updatedAt: new Date().toISOString(),
    }).where(eq(chapters.id, chapterId))

    const allChapters = await this.getChapters(chapter.comicId)
    const totalPageCount = allChapters.reduce((sum, ch) => sum + ch.pageCount, 0)
    await db.update(comics).set({
      pageCount: totalPageCount,
      updatedAt: new Date().toISOString(),
    }).where(eq(comics.id, chapter.comicId))
  },

  async reorderPages(chapterId: number, operations: PageOperation[], newFiles: Map<string, Buffer>): Promise<number> {
    const [chapter] = await db.select().from(chapters).where(eq(chapters.id, chapterId))
    if (!chapter) throw new Error('Chapter not found')

    const [comic] = await db.select().from(comics).where(eq(comics.id, chapter.comicId))
    if (!comic) throw new Error('Comic not found')

    const filePath = chapter.filePath
    const ext = path.extname(filePath).toLowerCase()

    const originalPages: { data: Buffer; name: string }[] = []

    if (ext === '.cbz' || ext === '.zip') {
      const zip = new AdmZip(filePath)
      const entries = zip.getEntries()
      const imageEntries = entries
        .filter(e => !e.isDirectory && isImageFile(e.entryName))
        .sort((a, b) => naturalSort(a.entryName, b.entryName))

      for (const entry of imageEntries) {
        originalPages.push({ data: entry.getData(), name: entry.entryName })
      }
    } else if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      const files = fs.readdirSync(filePath)
        .filter(name => isImageFile(name))
        .sort(naturalSort)

      for (const name of files) {
        originalPages.push({ data: fs.readFileSync(path.join(filePath, name)), name })
      }
    }

    const newPages: { data: Buffer; name: string }[] = []
    let newFileIdx = 0

    for (const op of operations) {
      if (op.type === 'original' && op.index !== undefined) {
        if (op.index >= 0 && op.index < originalPages.length) {
          newPages.push(originalPages[op.index])
        }
      } else if (op.type === 'new' && op.fileKey) {
        const fileData = newFiles.get(op.fileKey)
        if (fileData) {
          const imgExt = '.jpg'
          newPages.push({ data: fileData, name: `inserted_${newFileIdx}${imgExt}` })
          newFileIdx++
        }
      }
    }

    if (ext === '.cbz' || ext === '.zip') {
      const newZip = new AdmZip()
      for (let i = 0; i < newPages.length; i++) {
        const pageName = String(i + 1).padStart(4, '0') + path.extname(newPages[i].name)
        newZip.addFile(pageName, newPages[i].data)
      }
      const tempPath = filePath + '.tmp'
      newZip.writeZip(tempPath)
      fs.unlinkSync(filePath)
      fs.renameSync(tempPath, filePath)
    } else if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      const existingFiles = fs.readdirSync(filePath).filter(name => isImageFile(name))
      for (const name of existingFiles) {
        fs.unlinkSync(path.join(filePath, name))
      }
      for (let i = 0; i < newPages.length; i++) {
        const pageName = String(i + 1).padStart(4, '0') + path.extname(newPages[i].name)
        fs.writeFileSync(path.join(filePath, pageName), newPages[i].data)
      }
    }

    await db.update(chapters).set({
      pageCount: newPages.length,
      updatedAt: new Date().toISOString(),
    }).where(eq(chapters.id, chapterId))

    const allChapters = await this.getChapters(chapter.comicId)
    const totalPageCount = allChapters.reduce((sum, ch) => {
      return sum + (ch.id === chapterId ? newPages.length : ch.pageCount)
    }, 0)
    await db.update(comics).set({
      pageCount: totalPageCount,
      updatedAt: new Date().toISOString(),
    }).where(eq(comics.id, chapter.comicId))

    return newPages.length
  },
}
