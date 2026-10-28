import fs from 'fs'
import path from 'path'
import AdmZip from 'adm-zip'
import { XMLParser, XMLBuilder } from 'fast-xml-parser'
import { eq, asc } from 'drizzle-orm'
import { db, schema } from '@/db/index.js'
import type { AppSettings } from '@/types/index.js'

const { settings, comics, chapters, comicTags, comicCategories, tags, categories } = schema

const DEFAULTS: AppSettings = {
  defaultZoom: 50,
  metadataAutoWriteTime: '',
  metadataLastWriteAt: null,
}

// 元数据写入进度（模块级状态，供前端轮询）
export const metadataWriteProgress = {
  running: false,
  total: 0,
  processed: 0,
  current: '',
}

export const settingsService = {
  async getSettings(): Promise<AppSettings> {
    const rows = await db.select().from(settings)
    const map = new Map(rows.map(r => [r.key, r.value]))
    return {
      defaultZoom: parseInt(map.get('defaultZoom') || '', 10) || DEFAULTS.defaultZoom,
      metadataAutoWriteTime: map.get('metadataAutoWriteTime') ?? DEFAULTS.metadataAutoWriteTime,
      metadataLastWriteAt: map.get('metadataLastWriteAt') || null,
    }
  },

  async updateSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
    const entries: [string, string][] = []
    if (patch.defaultZoom !== undefined) {
      const z = Math.max(25, Math.min(200, Math.round(patch.defaultZoom)))
      entries.push(['defaultZoom', String(z)])
    }
    if (patch.metadataAutoWriteTime !== undefined) {
      const t = patch.metadataAutoWriteTime.trim()
      entries.push(['metadataAutoWriteTime', /^([01]?\d|2[0-3]):[0-5]\d$/.test(t) ? t : ''])
    }
    for (const [key, value] of entries) {
      await db.insert(settings).values({ key, value }).onConflictDoUpdate({ target: settings.key, set: { value } })
    }
    return this.getSettings()
  },

  /**
   * 把数据库中的元数据写回每部漫画所有章节 CBZ/ZIP 内的 ComicInfo.xml。
   * 漫画名/作者名以文件名解析（DB 权威值）覆盖 CBZ 内数据；
   * 标签/分类以 DB 关联（标签管理）为准，CBZ 里不在标签管理中的杂标签会被删除。
   */
  async writeAllMetadataToCbz(): Promise<{ written: number; skipped: number; errors: string[] }> {
    if (metadataWriteProgress.running) return { written: 0, skipped: 0, errors: ['写入进行中'] }
    metadataWriteProgress.running = true
    metadataWriteProgress.total = 0
    metadataWriteProgress.processed = 0
    metadataWriteProgress.current = ''

    const result = { written: 0, skipped: 0, errors: [] as string[] }
    try {
      const allComics = await db.select().from(comics).orderBy(asc(comics.id))

      // 预取标签/分类关联
      const tagRows = await db.select({ comicId: comicTags.comicId, name: tags.name })
        .from(comicTags).innerJoin(tags, eq(comicTags.tagId, tags.id))
      const catRows = await db.select({ comicId: comicCategories.comicId, name: categories.name })
        .from(comicCategories).innerJoin(categories, eq(comicCategories.categoryId, categories.id))
      const tagMap = new Map<number, string[]>()
      for (const r of tagRows) {
        if (!tagMap.has(r.comicId)) tagMap.set(r.comicId, [])
        tagMap.get(r.comicId)!.push(r.name)
      }
      const catMap = new Map<number, string[]>()
      for (const r of catRows) {
        if (!catMap.has(r.comicId)) catMap.set(r.comicId, [])
        catMap.get(r.comicId)!.push(r.name)
      }

      const chapterRows = await db.select().from(chapters).orderBy(asc(chapters.comicId), asc(chapters.sortOrder))
      const chaptersByComic = new Map<number, typeof chapterRows>()
      for (const ch of chapterRows) {
        if (!chaptersByComic.has(ch.comicId)) chaptersByComic.set(ch.comicId, [])
        chaptersByComic.get(ch.comicId)!.push(ch)
      }

      metadataWriteProgress.total = allComics.length

      for (const comic of allComics) {
        metadataWriteProgress.current = comic.title
        try {
          const comicChapters = chaptersByComic.get(comic.id) || []
          const chapterCount = comicChapters.length
          const comicTagsList = tagMap.get(comic.id) || []
          const comicCatsList = catMap.get(comic.id) || []
          let comicWritten = false

          for (const ch of comicChapters) {
            const filePath = ch.filePath
            if (!filePath || !fs.existsSync(filePath)) continue
            const ext = path.extname(filePath).toLowerCase()
            if (ext !== '.cbz' && ext !== '.zip') continue // CBR/RAR/文件夹无法写入

            try {
              const zip = new AdmZip(filePath)
              const existingEntry = zip.getEntries().find(
                e => !e.isDirectory && e.entryName.toLowerCase().endsWith('comicinfo.xml')
              )

              // 以已有 XML 为基础（保留白名单内的额外字段），再叠加数据库权威值
              let info: Record<string, unknown> = {}
              if (existingEntry) {
                try {
                  const parsed = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' })
                    .parse(existingEntry.getData().toString('utf-8'))
                  info = { ...(parsed.ComicInfo || parsed.comicinfo || {}) }
                } catch {}
              }

              info.Title = comic.title
              info.Series = comic.title
              if (comic.author) info.Writer = comic.author
              if (comic.artist) info.Penciller = comic.artist
              if (comic.description) info.Summary = comic.description
              const statusMap: Record<string, string> = { ongoing: 'Ongoing', completed: 'Completed', unknown: 'Unknown' }
              info.PublishingStatus = statusMap[comic.status] || 'Unknown'
              if (comic.year) info.Year = String(comic.year)
              if (comic.language) info.LanguageISO = comic.language
              // 标签/分类以 DB 关联为准（只保留标签管理里有的标签），覆盖 CBZ 原有值
              if (comicTagsList.length > 0) info.Tags = comicTagsList.join(', ')
              else delete info.Tags
              if (comicCatsList.length > 0) info.Categories = comicCatsList.join(', ')
              if (comic.bookId) info.BookId = comic.bookId
              if (comic.ageRating) info.AgeRating = comic.ageRating
              info.Number = String(ch.chapterNumber)
              if (chapterCount > 0) info.Count = String(chapterCount)

              const builder = new XMLBuilder({ ignoreAttributes: false, attributeNamePrefix: '@_', format: true })
              const xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n' + builder.build({ ComicInfo: info })
              if (existingEntry) {
                zip.updateFile(existingEntry, Buffer.from(xmlContent, 'utf-8'))
              } else {
                zip.addFile('ComicInfo.xml', Buffer.from(xmlContent, 'utf-8'))
              }
              zip.writeZip(filePath)
              comicWritten = true
            } catch (err) {
              result.errors.push(`${comic.title} 第${ch.chapterNumber}话: ${err instanceof Error ? err.message : String(err)}`)
            }
          }

          if (comicWritten) result.written++
          else result.skipped++
        } catch (err) {
          result.errors.push(`${comic.title}: ${err instanceof Error ? err.message : String(err)}`)
          result.skipped++
        }
        metadataWriteProgress.processed++
      }

      const now = new Date().toISOString()
      await db.insert(settings).values({ key: 'metadataLastWriteAt', value: now })
        .onConflictDoUpdate({ target: settings.key, set: { value: now } })
    } finally {
      metadataWriteProgress.running = false
      metadataWriteProgress.current = ''
    }
    return result
  },
}

// 定时写入元数据：每分钟检查一次是否到达当天设定的写入时间
let schedulerStarted = false
export function startMetadataScheduler(): void {
  if (schedulerStarted) return
  schedulerStarted = true
  setInterval(async () => {
    try {
      const set = await settingsService.getSettings()
      const m = /^(\d{1,2}):(\d{2})$/.exec((set.metadataAutoWriteTime || '').trim())
      if (!m) return // 未设置每天写入时间
      if (metadataWriteProgress.running) return
      const now = new Date()
      const scheduledToday = new Date(now)
      scheduledToday.setHours(Number(m[1]), Number(m[2]), 0, 0)
      if (now.getTime() < scheduledToday.getTime()) return // 今天还没到点
      const last = set.metadataLastWriteAt ? new Date(set.metadataLastWriteAt).getTime() : 0
      if (last >= scheduledToday.getTime()) return // 今天已写入过
      console.log('[Metadata] 定时写入元数据到 CBZ 开始')
      const r = await settingsService.writeAllMetadataToCbz()
      console.log(`[Metadata] 定时写入完成: 写入 ${r.written}, 跳过 ${r.skipped}, 错误 ${r.errors.length}`)
    } catch (err) {
      console.error('[Metadata] 定时写入失败:', err)
    }
  }, 60 * 1000)
}
