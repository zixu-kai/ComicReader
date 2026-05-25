import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { booksApi, annotationsApi, bookRatingsApi } from '@/services/api'
import type { BookBookmark } from '@/types'
import { X, Settings, Maximize, Minimize, List, ChevronLeft, ChevronRight, BookOpen, Highlighter, Plus, Edit3, Save, Sun, Moon, Type, Loader2, Bookmark } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import clsx from 'clsx'

interface BookReaderProps {
  bookId: number
  format: string
  initialCfi?: string
  initialChapter?: number
  onClose: () => void
}

interface ChapterInfo {
  title: string
  startPos: number
  endPos: number
}

interface Annotation {
  id: number
  targetType: string
  targetId: number
  page: number
  content: string
  note: string | null
  startOffset: number | null
  endOffset: number | null
  createdAt: string
  updatedAt: string
}

interface PageInfo {
  chapterIndex: number
  text: string
  chapterTitle: string
}

type PageTurnMode = 'click' | 'scroll' | 'slide'

interface ReaderSettings {
  fontSize: number
  lineHeight: number
  theme: 'dark' | 'light' | 'sepia'
  fontFamily: 'serif' | 'sans-serif' | 'system'
  flow: 'scrolled-doc' | 'paginated'
}

const EPUB_THEMES = {
  dark: {
    name: '暗黑',
    icon: Moon,
    body: {
      'color': '#e0e0e0',
      'background-color': '#1a1a2e',
    },
    'a': { 'color': '#6d9eeb' },
    'p': { 'margin': '0.8em 0' },
    'img': { 'max-width': '100%', 'height': 'auto' },
    'h1, h2, h3, h4, h5, h6': { 'color': '#f0f0f0', 'margin': '1em 0 0.5em' },
    'table': { 'border-collapse': 'collapse', 'width': '100%' },
    'td, th': { 'border': '1px solid #444', 'padding': '0.5em' },
  },
  light: {
    name: '明亮',
    icon: Sun,
    body: {
      'color': '#1a1a1a',
      'background-color': '#ffffff',
    },
    'a': { 'color': '#2563eb' },
    'p': { 'margin': '0.8em 0' },
    'img': { 'max-width': '100%', 'height': 'auto' },
    'h1, h2, h3, h4, h5, h6': { 'color': '#111', 'margin': '1em 0 0.5em' },
    'table': { 'border-collapse': 'collapse', 'width': '100%' },
    'td, th': { 'border': '1px solid #ccc', 'padding': '0.5em' },
  },
  sepia: {
    name: '护眼',
    icon: Type,
    body: {
      'color': '#5c4b37',
      'background-color': '#f4ecd8',
    },
    'a': { 'color': '#8b5e3c' },
    'p': { 'margin': '0.8em 0' },
    'img': { 'max-width': '100%', 'height': 'auto' },
    'h1, h2, h3, h4, h5, h6': { 'color': '#3d2e1f', 'margin': '1em 0 0.5em' },
    'table': { 'border-collapse': 'collapse', 'width': '100%' },
    'td, th': { 'border': '1px solid #c4b49a', 'padding': '0.5em' },
  },
}

const FONT_FAMILIES: { value: ReaderSettings['fontFamily']; label: string; name: string }[] = [
  { value: 'serif', label: '衬线', name: 'Georgia, "Times New Roman", serif' },
  { value: 'sans-serif', label: '无衬线', name: '"PingFang SC", "Microsoft YaHei", sans-serif' },
  { value: 'system', label: '系统默认', name: 'system-ui, -apple-system, sans-serif' },
]

const DEFAULT_EPUB_SETTINGS: ReaderSettings = {
  fontSize: 16,
  lineHeight: 1.8,
  theme: 'dark',
  fontFamily: 'sans-serif',
  flow: 'paginated',
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function BookReader({ bookId, format, initialCfi, initialChapter, onClose }: BookReaderProps) {
  const theme = useAppStore((s) => s.theme)
  const isEpub = format === 'epub'
  const isPdf = format === 'pdf'

  const [showSettings, setShowSettings] = useState(false)
  const [showToc, setShowToc] = useState(false)
  const [showAnnotations, setShowAnnotations] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [boundaryMsg, setBoundaryMsg] = useState<string | null>(null)

  const savedPrefs = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('txtReaderPrefs') || '{}') } catch { return {} }
  }, [])

  const [content, setContent] = useState('')
  const [totalContentLength, setTotalContentLength] = useState(0)
  const [contentOffset, setContentOffset] = useState(0)
  const [serverChapters, setServerChapters] = useState<{ title: string; startPos: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [fontSize, setFontSize] = useState(savedPrefs.fontSize || 16)
  const [lineHeight, setLineHeight] = useState(savedPrefs.lineHeight || 1.8)
  const [pageTurnMode, setPageTurnMode] = useState<PageTurnMode>(savedPrefs.pageTurnMode || 'click')
  const [slideOffset, setSlideOffset] = useState(0)
  const [customChapters, setCustomChapters] = useState<ChapterInfo[] | null>(() => {
    try {
      const saved = localStorage.getItem(`txtChapters_${bookId}`)
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [selectionPopup, setSelectionPopup] = useState<{ x: number; y: number; text: string } | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [isSaving] = useState(false)
  const [charsPerPage, setCharsPerPage] = useState(2000)

  const bookRef = useRef<any>(null)
  const renditionRef = useRef<any>(null)
  const epubContainerRef = useRef<HTMLDivElement>(null)
  const [epubToc, setEpubToc] = useState<any[]>([])
  const [epubTitle, setEpubTitle] = useState('')
  const [epubSettings, setEpubSettings] = useState<ReaderSettings>(() => {
    try {
      const saved = localStorage.getItem('epubSettings')
      return saved ? { ...DEFAULT_EPUB_SETTINGS, ...JSON.parse(saved) } : DEFAULT_EPUB_SETTINGS
    } catch { return DEFAULT_EPUB_SETTINGS }
  })
  const epubSettingsRef = useRef<ReaderSettings>(epubSettings)
  const [loadError, setLoadError] = useState(false)
  const [loadingText] = useState('加载中...')
  const [epubEditMode, setEpubEditMode] = useState(false)
  const [epubEditContent, setEpubEditContent] = useState('')
  const [hiddenTocEntries, setHiddenTocEntries] = useState<Set<string>>(new Set())

  const contentAreaRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const touchedRef = useRef(false)
  const pagesRef = useRef<PageInfo[]>([])
  const currentPageRef = useRef(0)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const isTouchingRef = useRef(false)
  const gestureDirRef = useRef<'h' | 'v' | null>(null)
  const mouseStartRef = useRef<{ x: number } | null>(null)
  const isDraggingRef = useRef(false)
  const initialPageSetRef = useRef(false)
  const readingStatusRef = useRef<'unread' | 'reading' | 'read'>('unread')
  const transitioningRef = useRef(false)
  const editStartOffsetRef = useRef(0)
  const resizeAnchorRef = useRef(0)

  const pdfCanvasRef = useRef<HTMLCanvasElement>(null)
  const [pdfScale, setPdfScale] = useState(1.5)
  const [pdfRendering, setPdfRendering] = useState(false)
  const pdfDocRef = useRef<any>(null)

  useEffect(() => {
    localStorage.setItem('txtReaderPrefs', JSON.stringify({ pageTurnMode, fontSize, lineHeight }))
  }, [pageTurnMode, fontSize, lineHeight])

  useEffect(() => {
    if (customChapters !== null) {
      localStorage.setItem(`txtChapters_${bookId}`, JSON.stringify(customChapters))
    }
  }, [customChapters, bookId])

  useEffect(() => {
    if (isEpub) {
      let mounted = true
      let sandboxObserver: MutationObserver | null = null

      const loadEpub = async () => {
        try {
          setLoading(true)

          const ePub = (await import('epubjs')).default
          const fileUrl = booksApi.getFileUrl(bookId)
          const book = ePub(fileUrl, { openAs: 'epub' })
          bookRef.current = book

          // @ts-ignore - epubjs types incomplete
          book.on('openFailed', (err: any) => {
            console.error('EPUB open failed:', err)
          })

          await book.ready

          if (!epubContainerRef.current) {
            throw new Error('EPUB container not ready')
          }

          sandboxObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
              for (const node of Array.from(mutation.addedNodes)) {
                if (node instanceof HTMLIFrameElement) {
                  const sandbox = node.getAttribute('sandbox') || ''
                  if (!sandbox.includes('allow-scripts')) {
                    node.setAttribute('sandbox', sandbox ? sandbox + ' allow-scripts' : 'allow-same-origin allow-scripts')
                  }
                }
                if (node instanceof HTMLElement) {
                  const iframes = node.querySelectorAll?.('iframe')
                  if (iframes) {
                    for (const iframe of Array.from(iframes)) {
                      const sandbox = iframe.getAttribute('sandbox') || ''
                      if (!sandbox.includes('allow-scripts')) {
                        iframe.setAttribute('sandbox', sandbox ? sandbox + ' allow-scripts' : 'allow-same-origin allow-scripts')
                      }
                    }
                  }
                }
              }
            }
          })
          sandboxObserver.observe(epubContainerRef.current, { childList: true, subtree: true })

          const rendition = book.renderTo(epubContainerRef.current, {
            width: '100%',
            height: '100%',
            spread: 'none',
            flow: epubSettingsRef.current.flow || 'paginated',
            allowScriptedContent: true,
            method: 'blobUrl',
          })
          renditionRef.current = rendition

          rendition.on('displayError', (err: any) => {
            console.error('EPUB display error:', err)
          })

          // @ts-ignore - epubjs types incomplete
          book.spine.hooks.serialize.register((_output: string, section: any) => {
            if (section.output && typeof section.output === 'string') {
              section.output = section.output.replace(/@font-face\s*\{[^}]*file:\/\/[^}]*\}/gi, '')
            }
          })

          applyEpubThemeAndStyle(epubSettingsRef.current)

          if (initialCfi) {
            await rendition.display(initialCfi)
          } else {
            await rendition.display()
          }
          setLoading(false)

          book.loaded.navigation.then((nav: any) => {
            if (!mounted) return
            setEpubToc(nav.toc)
            if (initialChapter !== undefined && nav.toc.length > 0 && initialChapter < nav.toc.length) {
              const target = nav.toc[initialChapter]
              if (target?.href) {
                rendition.display(target.href)
              }
            }
          })

          requestAnimationFrame(() => {
            if (!mounted) return
            book.locations.generate(2048).then(() => {
              if (mounted) {
                setTotalPages(book.locations.length())
              }
            }).catch(() => {})
          })

          rendition.on('relocated', (location: any) => {
            if (mounted) {
              const locLen = book.locations.length()
              if (locLen > 0) {
                const pct = book.locations.percentageFromCfi(location.start.cfi)
                setCurrentPage(Math.floor(pct * locLen))
              }
              setEpubTitle(location.start.label || '')

              booksApi.updateProgress(bookId, {
                cfi: location.start.cfi,
                percentage: locLen > 0 ? Math.round(book.locations.percentageFromCfi(location.start.cfi) * 10000) / 100 : 0,
              }).catch(() => {})
            }
          })

          rendition.on('click', (event: any) => {
            const rect = epubContainerRef.current?.getBoundingClientRect()
            if (!rect) return
            const x = (event.pageX - rect.left) / rect.width
            if (x < 0.3) {
              rendition.prev()
            } else if (x > 0.7) {
              rendition.next()
            }
          })
        } catch (err) {
          console.error('Failed to load EPUB:', err)
          setLoadError(true)
          setLoading(false)
        }
      }

      loadEpub()

      return () => {
        mounted = false
        sandboxObserver?.disconnect()
        renditionRef.current?.destroy()
        bookRef.current?.destroy()
      }
    } else if (isPdf) {
      let mounted = true

      const loadPdf = async () => {
        try {
          const pdfjsLib = await import('pdfjs-dist')
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

          const loadingTask = pdfjsLib.getDocument(booksApi.getFileUrl(bookId))
          const pdf = await loadingTask.promise
          pdfDocRef.current = pdf

          if (mounted) {
            setTotalPages(pdf.numPages)
            renderPdfPage(initialChapter || 1)
            setLoading(false)
          }
        } catch {
          setLoadError(true)
          setLoading(false)
        }
      }

      loadPdf()

      return () => {
        mounted = false
        pdfDocRef.current?.destroy()
      }
    } else {
      let mounted = true

      const loadInitialContent = async () => {
        try {
          const chaptersData = await booksApi.getChapters(bookId).catch(() => [])
          if (!mounted) return
          setServerChapters(chaptersData)

          let rangeStart = 0
          let savedOffset = 0

          if (chaptersData.length > 0) {
            const progress = await booksApi.getProgress(bookId).catch(() => null)
            savedOffset = progress?.charOffset || 0

            let targetChapterIdx = 0
            for (let i = 0; i < chaptersData.length; i++) {
              if (chaptersData[i]!.startPos <= savedOffset) {
                targetChapterIdx = i
              } else {
                break
              }
            }

            rangeStart = targetChapterIdx > 0 ? chaptersData[targetChapterIdx - 1]!.startPos : 0
          }

          try {
            const rangeEnd = rangeStart + 50000
            const result = await booksApi.getTextRange(bookId, rangeStart, rangeEnd)
            if (!mounted) return

            setContentOffset(rangeStart)
            setTotalContentLength(result.totalLength)
            setContent(result.text)

            if (savedOffset > 0 && savedOffset >= rangeStart && savedOffset < rangeStart + result.text.length) {
              resizeAnchorRef.current = savedOffset - rangeStart
            }
          } catch {
            const response = await fetch(`${booksApi.getFileUrl(bookId)}?t=${Date.now()}`)
            if (!response.ok) throw new Error('Failed to fetch')
            const buffer = await response.arrayBuffer()
            const uint8 = new Uint8Array(buffer)
            let text: string
            try {
              text = new TextDecoder('utf-8', { fatal: true }).decode(uint8)
            } catch {
              text = new TextDecoder('gbk').decode(uint8)
            }
            if (!mounted) return

            const MAX_CHARS = 50000
            setContentOffset(0)
            setTotalContentLength(text.length)
            setContent(text.length > MAX_CHARS ? text.substring(0, MAX_CHARS) : text)
          }
        } catch {
          if (mounted) setContent('文件加载失败')
        } finally {
          if (mounted) setLoading(false)
        }
      }

      loadInitialContent()

      return () => { mounted = false }
    }
  }, [bookId])

  useEffect(() => {
    if (!isEpub || !epubContainerRef.current) return

    const observer = new ResizeObserver(() => {
      if (renditionRef.current) {
        renditionRef.current.resize()
      }
    })
    observer.observe(epubContainerRef.current)
    return () => observer.disconnect()
  }, [isEpub])

  const chapters = useMemo<ChapterInfo[]>(() => {
    if (!content) return []

    const lines = content.split('\n')
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

    if (bestMatches.length === 0) return []

    const adjustedMatches = bestMatches.map(match => {
      let startPos = match.startPos
      const contentAtPos = content.slice(startPos, startPos + match.title.length + 20)
      if (!contentAtPos.includes(match.title)) {
        if (contentAtPos.trimStart().startsWith(match.title)) {
          // startPos is correct, just has leading whitespace
        } else {
          const searchStart = Math.max(0, startPos - 20)
          const idx = content.indexOf(match.title, searchStart)
          if (idx >= 0 && idx <= startPos + 20) {
            startPos = idx
          }
        }
      }
      return { ...match, startPos }
    })

    const result: ChapterInfo[] = []

    const firstMatch = adjustedMatches[0]!
    if (firstMatch.startPos > 0) {
      const prefixContent = content.slice(0, firstMatch.startPos).trim()
      if (prefixContent.length > 0) {
        result.push({ title: '开头', startPos: 0, endPos: firstMatch.startPos })
      }
    }

    for (let i = 0; i < adjustedMatches.length; i++) {
      const match = adjustedMatches[i]!
      const endPos = i < adjustedMatches.length - 1 ? adjustedMatches[i + 1]!.startPos : content.length
      result.push({ title: match.title, startPos: match.startPos, endPos })
    }

    return result
  }, [content])

  const effectiveChapters = useMemo(() => customChapters ?? chapters, [customChapters, chapters])

  const computeCharsPerPage = useCallback(() => {
    const outerWidth = contentAreaRef.current?.clientWidth || (window.innerWidth - 48)
    const outerHeight = contentAreaRef.current?.clientHeight || (window.innerHeight - 160)
    const textWidth = Math.min(outerWidth - 48, 768) - 32
    const textHeight = outerHeight - 32
    const charsPerLine = Math.floor(textWidth / fontSize)
    const linesPerPage = Math.floor(textHeight / (fontSize * lineHeight))
    return Math.max(100, Math.floor(charsPerLine * linesPerPage * 0.5))
  }, [fontSize, lineHeight])

  useEffect(() => {
    setCharsPerPage(computeCharsPerPage())
  }, [computeCharsPerPage])

  const estimatedPages = useMemo<PageInfo[]>(() => {
    if (!content) return []

    const cpp = charsPerPage

    if (effectiveChapters.length > 0) {
      const result: PageInfo[] = []
      for (let ci = 0; ci < effectiveChapters.length; ci++) {
        const ch = effectiveChapters[ci]!
        const chapterContent = content.slice(ch.startPos, ch.endPos)

        if (chapterContent.length <= cpp) {
          result.push({ chapterIndex: ci, text: chapterContent, chapterTitle: ch.title })
        } else {
          let pos = 0
          while (pos < chapterContent.length) {
            let end = Math.min(pos + cpp, chapterContent.length)

            if (end < chapterContent.length) {
              const searchStart = Math.max(pos + Math.floor(cpp * 0.8), pos)
              for (let i = end; i >= searchStart; i--) {
                if (chapterContent[i] === '\n') {
                  end = i + 1
                  break
                }
              }
            }

            result.push({ chapterIndex: ci, text: chapterContent.slice(pos, end), chapterTitle: ch.title })
            pos = end
          }
        }
      }
      return result
    }

    const result: PageInfo[] = []
    let pos = 0
    while (pos < content.length) {
      let end = Math.min(pos + cpp, content.length)

      if (end < content.length) {
        const searchStart = Math.max(pos + Math.floor(cpp * 0.8), pos)
        for (let i = end; i >= searchStart; i--) {
          if (content[i] === '\n') {
            end = i + 1
            break
          }
        }
      }

      result.push({ chapterIndex: -1, text: content.slice(pos, end), chapterTitle: '' })
      pos = end
    }
    return result
  }, [content, effectiveChapters, charsPerPage])

  const [measuredPages, setMeasuredPages] = useState<PageInfo[] | null>(null)
  const measureKeyRef = useRef(0)
  const [resizeVersion, setResizeVersion] = useState(0)

  useEffect(() => {
    measureKeyRef.current++
    setMeasuredPages(null)
  }, [content, fontSize, lineHeight])

  useEffect(() => {
    if (isEpub || isPdf || !content || loading) return

    const key = measureKeyRef.current
    const scrollEl = scrollRef.current
    if (!scrollEl) return

    const doMeasure = () => {
      if (measureKeyRef.current !== key) return

      const containerHeight = scrollEl.clientHeight
      if (containerHeight <= 0) return

      const measurePre = document.createElement('pre')
      measurePre.className = 'whitespace-pre-wrap break-words font-sans text-pretty'
      measurePre.style.cssText = `position:absolute;visibility:hidden;height:auto;width:${scrollEl.clientWidth - 32}px;font-size:${fontSize}px;line-height:${lineHeight};`
      scrollEl.appendChild(measurePre)

      let lo = 0
      let hi = Math.min(content.length, 10000)
      let estimatedCpp = 2000

      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2)
        measurePre.textContent = content.substring(0, mid)
        if (measurePre.scrollHeight <= containerHeight) {
          estimatedCpp = mid
          lo = mid + 1
        } else {
          hi = mid - 1
        }
      }

      const anchor = resizeAnchorRef.current

      const paginateSegment = (start: number, end: number): PageInfo[] => {
        const segPages: PageInfo[] = []
        let segPos = start
        let segChapterIdx = 0

        if (effectiveChapters.length > 0) {
          while (segChapterIdx < effectiveChapters.length - 1 &&
                 effectiveChapters[segChapterIdx + 1]!.startPos <= start) {
            segChapterIdx++
          }
        }

        while (segPos < end) {
          if (measureKeyRef.current !== key) return segPages

          let segEnd = Math.min(segPos + estimatedCpp, end)

          measurePre.textContent = content.substring(segPos, segEnd)

          if (measurePre.scrollHeight <= containerHeight) {
            let addLo = segEnd
            let addHi = end
            while (addLo <= addHi) {
              const mid = Math.floor((addLo + addHi) / 2)
              measurePre.textContent = content.substring(segPos, mid)
              if (measurePre.scrollHeight <= containerHeight) {
                segEnd = mid
                addLo = mid + 1
              } else {
                addHi = mid - 1
              }
            }
          } else {
            let subLo = segPos + 1
            let subHi = segEnd
            while (subLo <= subHi) {
              const mid = Math.floor((subLo + subHi) / 2)
              measurePre.textContent = content.substring(segPos, mid)
              if (measurePre.scrollHeight <= containerHeight) {
                segEnd = mid
                subLo = mid + 1
              } else {
                subHi = mid - 1
              }
            }
          }

          if (effectiveChapters.length > 0) {
            while (segChapterIdx < effectiveChapters.length - 1 &&
                   effectiveChapters[segChapterIdx + 1]!.startPos <= segPos) {
              segChapterIdx++
            }
          }

          if (segEnd < end && segEnd > segPos) {
            const searchStart = Math.max(segPos + Math.floor((segEnd - segPos) * 0.8), segPos)
            for (let i = segEnd; i >= searchStart; i--) {
              if (content[i] === '\n') {
                segEnd = i + 1
                break
              }
            }
          }

          if (segEnd <= segPos) segEnd = segPos + 1

          estimatedCpp = Math.max(100, segEnd - segPos)

          if (effectiveChapters.length > 0) {
            segPages.push({ chapterIndex: segChapterIdx, text: content.slice(segPos, segEnd), chapterTitle: effectiveChapters[segChapterIdx]?.title || '' })
          } else {
            segPages.push({ chapterIndex: -1, text: content.slice(segPos, segEnd), chapterTitle: '' })
          }

          segPos = segEnd
        }

        return segPages
      }

      let newPages: PageInfo[]
      let targetPage = 0

      if (anchor > 0 && anchor < content.length) {
        const beforePages = paginateSegment(0, anchor)
        const afterPages = paginateSegment(anchor, content.length)
        newPages = [...beforePages, ...afterPages]
        targetPage = beforePages.length
      } else {
        newPages = paginateSegment(0, content.length)
      }

      if (effectiveChapters.length > 0) {
        for (let pi = newPages.length - 2; pi >= 0; pi--) {
          const page = newPages[pi]!
          for (let ci = 0; ci < effectiveChapters.length; ci++) {
            const title = effectiveChapters[ci]!.title
            const titleIdx = page.text.indexOf(title)
            if (titleIdx > 0) {
              const moveToNext = page.text.slice(titleIdx)
              newPages[pi] = {
                chapterIndex: page.chapterIndex,
                text: page.text.slice(0, titleIdx),
                chapterTitle: page.chapterTitle,
              }
              const nextPage = newPages[pi + 1]!
              newPages[pi + 1] = {
                chapterIndex: ci,
                text: moveToNext + nextPage.text,
                chapterTitle: title,
              }
              break
            }
          }
        }
      }

      measurePre.remove()

      if (measureKeyRef.current !== key) return

      resizeAnchorRef.current = 0
      if (anchor > 0 && newPages.length > 0) {
        setMeasuredPages(newPages)
        setCurrentPage(targetPage)
      } else {
        setMeasuredPages(newPages)
      }
    }

    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(doMeasure)
    })
    return () => cancelAnimationFrame(raf)
  }, [content, fontSize, lineHeight, effectiveChapters, isEpub, isPdf, loading, resizeVersion])

  const pages = measuredPages ?? estimatedPages
  pagesRef.current = pages
  currentPageRef.current = currentPage

  const pageStartOffsets = useMemo(() => {
    const offsets: number[] = []
    let cumLen = 0
    for (const page of pages) {
      offsets.push(cumLen)
      cumLen += page.text.length
    }
    return offsets
  }, [pages])

  const getHighlightedHtml = useCallback((text: string, startInContent: number): string => {
    if (annotations.length === 0) return escapeHtml(text)

    const pageStartAbs = contentOffset + startInContent
    const pageEndAbs = pageStartAbs + text.length

    const overlapping = annotations.filter(ann =>
      ann.startOffset != null && ann.endOffset != null &&
      ann.startOffset < pageEndAbs && ann.endOffset > pageStartAbs
    )

    if (overlapping.length === 0) return escapeHtml(text)

    const ranges = overlapping.map(ann => ({
      start: Math.max(0, ann.startOffset! - pageStartAbs),
      end: Math.min(text.length, ann.endOffset! - pageStartAbs),
    })).sort((a, b) => a.start - b.start)

    const merged: { start: number; end: number }[] = []
    for (const r of ranges) {
      if (merged.length > 0 && r.start <= merged[merged.length - 1]!.end) {
        merged[merged.length - 1]!.end = Math.max(merged[merged.length - 1]!.end, r.end)
      } else {
        merged.push({ ...r })
      }
    }

    let result = ''
    let lastEnd = 0
    for (const { start, end } of merged) {
      if (start > lastEnd) {
        result += escapeHtml(text.substring(lastEnd, start))
      }
      result += `<mark style="background-color:rgba(59,130,246,0.3);color:inherit">`
      result += escapeHtml(text.substring(start, end))
      result += `</mark>`
      lastEnd = end
    }
    if (lastEnd < text.length) {
      result += escapeHtml(text.substring(lastEnd))
    }

    return result
  }, [annotations, contentOffset])

  useEffect(() => {
    if (isEpub || isPdf) return
    let debounceTimer: ReturnType<typeof setTimeout>
    const handleResize = () => {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        const p = pagesRef.current
        const cp = currentPageRef.current
        let cumLen = 0
        for (let i = 0; i < cp && i < p.length; i++) {
          cumLen += p[i]!.text.length
        }
        resizeAnchorRef.current = cumLen
        setResizeVersion(v => v + 1)
      }, 150)
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(debounceTimer)
    }
  }, [isEpub, isPdf])

  useEffect(() => {
    if (isEpub || isPdf || !content || serverChapters.length === 0) return
    if (pages.length === 0 || currentPage < pages.length - 3) return

    const loadedEnd = contentOffset + content.length
    if (loadedEnd >= totalContentLength) return

    const loadMore = async () => {
      try {
        const rangeEnd = Math.min(loadedEnd + 50000, totalContentLength)
        const result = await booksApi.getTextRange(bookId, loadedEnd, rangeEnd)
        setContent(prev => prev + result.text)
        setTotalContentLength(result.totalLength)
      } catch {}
    }
    loadMore()
  }, [currentPage, pages.length, content, contentOffset, totalContentLength, serverChapters, isEpub, isPdf, bookId])

  const txtTotalPages = pages.length || 1
  const isChapterMode = effectiveChapters.length > 0
  const currentChapterIndex = pages[currentPage]?.chapterIndex ?? -1

  useEffect(() => {
    if (!isEpub && !isPdf && txtTotalPages > 0 && currentPage >= txtTotalPages) {
      setCurrentPage(Math.max(0, txtTotalPages - 1))
    }
  }, [currentPage, txtTotalPages, isEpub, isPdf])

  useEffect(() => {
    if (!isEpub && !isPdf && content && txtTotalPages > 0 && !initialPageSetRef.current) {
      initialPageSetRef.current = true
      if (initialChapter !== undefined && initialChapter >= 0) {
        const pageIndex = pages.findIndex(p => p.chapterIndex === initialChapter)
        if (pageIndex >= 0) {
          setCurrentPage(pageIndex)
        }
      } else {
        booksApi.getProgress(bookId).then((progress) => {
          if (progress?.charOffset && progress.charOffset > 0 && pages.length > 0) {
            const localOffset = progress.charOffset - contentOffset
            if (localOffset > 0 && localOffset < content.length) {
              let cumLen = 0
              for (let i = 0; i < pages.length; i++) {
                if (cumLen >= localOffset) {
                  setCurrentPage(i)
                  return
                }
                cumLen += pages[i]!.text.length
              }
            }
            setCurrentPage(0)
          } else if (progress?.currentPage && progress.currentPage > 0) {
            setCurrentPage(Math.min(progress.currentPage, txtTotalPages - 1))
          }
        }).catch(() => {})
      }
    }
  }, [content, txtTotalPages, bookId, initialChapter, pages, isEpub, isPdf])

  const saveProgress = useCallback(() => {
    if (isEpub || isPdf) return
    if (txtTotalPages > 0 && content) {
      const pct = totalContentLength > 0
        ? Math.round(((contentOffset + (currentPage > 0 ? pages.slice(0, currentPage).reduce((s, p) => s + p.text.length, 0) : 0)) / totalContentLength) * 10000) / 100
        : Math.round((currentPage / txtTotalPages) * 10000) / 100
      let charOffset = contentOffset
      for (let i = 0; i < currentPage && i < pages.length; i++) {
        charOffset += pages[i]!.text.length
      }
      booksApi.updateProgress(bookId, { percentage: pct, currentPage, totalPages: txtTotalPages, charOffset }).catch(() => {})
    }
  }, [bookId, currentPage, txtTotalPages, content, isEpub, isPdf, pages, contentOffset, totalContentLength])

  const goNext = useCallback(() => {
    if (isEpub) {
      renditionRef.current?.next()
      return
    }
    if (isPdf) {
      if (currentPage < totalPages) {
        renderPdfPage(currentPage + 1)
      }
      return
    }
    if (currentPage < txtTotalPages - 1) {
      setCurrentPage(p => p + 1)
      setSlideOffset(0)
    } else {
      setBoundaryMsg('已读完')
    }
  }, [currentPage, txtTotalPages, totalPages, isEpub, isPdf])

  const goPrev = useCallback(() => {
    if (isEpub) {
      renditionRef.current?.prev()
      return
    }
    if (isPdf) {
      if (currentPage > 1) {
        renderPdfPage(currentPage - 1)
      }
      return
    }
    if (currentPage > 0) {
      setCurrentPage(p => p - 1)
      setSlideOffset(0)
    } else {
      setBoundaryMsg('已到起始页')
    }
  }, [currentPage, isEpub, isPdf, totalPages])

  const goToPage = useCallback((p: number) => {
    if (isEpub || isPdf) return
    const target = Math.max(0, Math.min(Math.floor(p), txtTotalPages - 1))
    setCurrentPage(target)
    setSlideOffset(0)
  }, [txtTotalPages, isEpub, isPdf])

  const goToChapter = useCallback(async (chapterIndex: number) => {
    if (isEpub) {
      if (epubToc[chapterIndex]?.href) {
        renditionRef.current?.display(epubToc[chapterIndex].href)
      }
      setShowToc(false)
      return
    }

    const chapterList = customChapters || chapters
    if (chapterIndex < 0 || chapterIndex >= chapterList.length) return

    const ch = chapterList[chapterIndex]!

    if (ch.startPos >= 0 && ch.startPos < content.length) {
      if (pageTurnMode === 'scroll') {
        if (scrollRef.current) {
          const textBefore = content.substring(0, ch.startPos)
          const linesBefore = textBefore.split('\n').length
          const lineHeightPx = fontSize * lineHeight
          const targetScrollTop = linesBefore * lineHeightPx
          scrollRef.current.scrollTop = targetScrollTop
        }
      } else {
        let charPos = ch.startPos + contentOffset
        let cumLen = 0
        let page = 0
        for (let i = 0; i < pages.length; i++) {
          const pageStart = cumLen
          const pageEnd = cumLen + (pages[i]?.text?.length || 0)
          if (charPos >= pageStart && charPos < pageEnd) {
            page = i
            break
          }
          if (charPos >= pageEnd) {
            page = i + 1
          }
          cumLen = pageEnd
        }
        if (page >= pages.length) page = pages.length - 1
        setCurrentPage(page)
        setSlideOffset(0)
      }
    } else if (serverChapters.length > 0) {
      setLoading(true)
      try {
        const rangeStart = chapterIndex > 0 ? serverChapters[chapterIndex - 1]!.startPos : 0
        const rangeEnd = rangeStart + 300000

        const result = await booksApi.getTextRange(bookId, rangeStart, rangeEnd)
        setContentOffset(rangeStart)
        setTotalContentLength(result.totalLength)
        setContent(result.text)
        resizeAnchorRef.current = serverChapters[chapterIndex]!.startPos - rangeStart
      } catch {}
      setLoading(false)
    }
    setShowToc(false)
  }, [isEpub, epubToc, customChapters, chapters, content, pageTurnMode, fontSize, lineHeight, pages, scrollRef, contentOffset, serverChapters, bookId])

  const goToCfi = useCallback((cfi: string) => {
    renditionRef.current?.display(cfi)
    setShowToc(false)
  }, [])

  const renderPdfPage = useCallback(async (pageNum: number) => {
    if (!pdfDocRef.current || pdfRendering) return
    setPdfRendering(true)

    try {
      const page = await pdfDocRef.current.getPage(pageNum)
      const canvas = pdfCanvasRef.current
      if (!canvas) return

      const context = canvas.getContext('2d')
      const viewport = page.getViewport({ scale: pdfScale })

      canvas.height = viewport.height
      canvas.width = viewport.width

      await page.render({
        canvasContext: context,
        viewport,
      }).promise

      setCurrentPage(pageNum)

      booksApi.updateProgress(bookId, {
        currentPage: pageNum,
        totalPages: pdfDocRef.current.numPages,
        percentage: Math.round((pageNum / pdfDocRef.current.numPages) * 10000) / 100,
      })
    } finally {
      setPdfRendering(false)
    }
  }, [bookId, pdfScale, pdfRendering])

  useEffect(() => {
    if (pdfDocRef.current && isPdf) {
      renderPdfPage(currentPage || 1)
    }
  }, [pdfScale, isPdf])

  useEffect(() => {
    if (touchedRef.current && !isEpub && !isPdf) {
      saveProgress()
    }
    touchedRef.current = true
  }, [currentPage, isEpub, isPdf])

  useEffect(() => {
    if (pageTurnMode !== 'scroll' && scrollRef.current && !isEpub && !isPdf) {
      scrollRef.current.scrollTop = 0
    }
  }, [currentPage, pageTurnMode, isEpub, isPdf])

  useEffect(() => {
    if (boundaryMsg) {
      const timer = setTimeout(() => setBoundaryMsg(null), 1500)
      return () => clearTimeout(timer)
    }
  }, [boundaryMsg])

  useEffect(() => {
    if (!isEpub && !isPdf && content && currentPage > 0 && readingStatusRef.current === 'unread') {
      readingStatusRef.current = 'reading'
      bookRatingsApi.get(bookId).then(rating => {
        bookRatingsApi.set(bookId, rating?.score ?? 0, 'reading').catch(() => {})
      }).catch(() => {
        bookRatingsApi.set(bookId, 0, 'reading').catch(() => {})
      })
    }
  }, [content, currentPage, bookId, isEpub, isPdf])

  useEffect(() => {
    if (!isEpub && !isPdf && content && currentPage >= txtTotalPages - 1 && txtTotalPages > 1 && readingStatusRef.current !== 'read') {
      readingStatusRef.current = 'read'
      bookRatingsApi.get(bookId).then(rating => {
        bookRatingsApi.set(bookId, rating?.score ?? 0, 'read').catch(() => {})
      }).catch(() => {
        bookRatingsApi.set(bookId, 0, 'read').catch(() => {})
      })
    }
  }, [content, currentPage, txtTotalPages, bookId, isEpub, isPdf])

  const applyEpubThemeAndStyle = useCallback((s: ReaderSettings) => {
    if (!renditionRef.current) return
    const ff = FONT_FAMILIES.find(f => f.value === s.fontFamily)
    const themeSource = EPUB_THEMES[s.theme]
    const bodyStyles: Record<string, string> = {
      ...themeSource.body,
      'font-size': `${s.fontSize}px`,
      'line-height': String(s.lineHeight),
      'padding': '20px 40px !important',
    }
    if (ff) {
      bodyStyles['font-family'] = ff.name
    }
    const themeObj: Record<string, Record<string, string>> = { body: bodyStyles }
    for (const [key, value] of Object.entries(themeSource)) {
      if (key === 'name' || key === 'icon' || key === 'body') continue
      themeObj[key] = value as Record<string, string>
    }
    renditionRef.current.themes.register('custom', themeObj as any)
    renditionRef.current.themes.select('custom')
  }, [])

  const switchEpubFlow = useCallback(async (newFlow: ReaderSettings['flow']) => {
    const book = bookRef.current
    if (!book || !epubContainerRef.current) return

    const currentLocation = renditionRef.current?.currentLocation()
    const currentCfi = currentLocation?.start?.cfi

    renditionRef.current?.destroy()
    renditionRef.current = null

    const next = { ...epubSettingsRef.current, flow: newFlow }
    epubSettingsRef.current = next
    setEpubSettings(next)
    localStorage.setItem('epubSettings', JSON.stringify(next))

    const rendition = book.renderTo(epubContainerRef.current, {
      width: '100%',
      height: '100%',
      spread: 'none',
      flow: newFlow,
      allowScriptedContent: true,
      method: 'blobUrl',
    })

    renditionRef.current = rendition

    bookRef.current.spine.hooks.serialize.register((_output: string, section: any) => {
      if (section.output && typeof section.output === 'string') {
        section.output = section.output.replace(/@font-face\s*\{[^}]*file:\/\/[^}]*\}/gi, '')
      }
    })

    applyEpubThemeAndStyle(next)

    if (currentCfi) {
      await rendition.display(currentCfi)
    } else {
      await rendition.display()
    }

    rendition.on('relocated', (location: any) => {
      const locLen = book.locations.length()
      if (locLen > 0) {
        const pct = book.locations.percentageFromCfi(location.start.cfi)
        setCurrentPage(Math.floor(pct * locLen))
      }
      setEpubTitle(location.start.label || '')

      booksApi.updateProgress(bookId, {
        cfi: location.start.cfi,
        percentage: locLen > 0 ? Math.round(book.locations.percentageFromCfi(location.start.cfi) * 10000) / 100 : 0,
      }).catch(() => {})
    })

    rendition.on('click', (event: any) => {
      const rect = epubContainerRef.current?.getBoundingClientRect()
      if (!rect) return
      const x = (event.pageX - rect.left) / rect.width
      if (x < 0.3) {
        rendition.prev()
      } else if (x > 0.7) {
        rendition.next()
      }
    })
  }, [bookId, applyEpubThemeAndStyle])

  const updateEpubSettings = useCallback((partial: Partial<ReaderSettings>) => {
    if (partial.flow !== undefined && partial.flow !== epubSettingsRef.current.flow) {
      switchEpubFlow(partial.flow)
      return
    }

    const next = { ...epubSettingsRef.current, ...partial }
    epubSettingsRef.current = next
    setEpubSettings(next)
    localStorage.setItem('epubSettings', JSON.stringify(next))
    applyEpubThemeAndStyle(next)
  }, [applyEpubThemeAndStyle, switchEpubFlow])

  useEffect(() => {
    if (isEpub) {
      if (theme === 'light' && epubSettings.theme === 'dark') {
        updateEpubSettings({ theme: 'light' })
      } else if (theme === 'dark' && epubSettings.theme === 'light') {
        updateEpubSettings({ theme: 'dark' })
      }
    }
  }, [theme, isEpub])

  const [epubBookmarks, setEpubBookmarks] = useState<BookBookmark[]>([])

  const fetchEpubBookmarks = useCallback(() => {
    booksApi.getBookmarks(bookId).then(setEpubBookmarks).catch(() => setEpubBookmarks([]))
  }, [bookId])

  const addEpubBookmark = useCallback(async () => {
    const location = renditionRef.current?.currentLocation()
    if (location?.start?.cfi) {
      const customTitle = window.prompt('书签标题', epubTitle || undefined)
      if (customTitle === null) return
      try {
        const bm = await booksApi.createBookmark(bookId, {
          cfi: location.start.cfi,
          title: customTitle || epubTitle || undefined,
        })
        setEpubBookmarks(prev => [bm, ...prev])
      } catch {}
    }
  }, [bookId, epubTitle])

  const deleteEpubBookmark = useCallback(async (bookmarkId: number) => {
    try {
      await booksApi.deleteBookmark(bookId, bookmarkId)
      setEpubBookmarks(prev => prev.filter(b => b.id !== bookmarkId))
    } catch {}
  }, [bookId])

  const addBookmark = useCallback(async () => {
    const location = renditionRef.current?.currentLocation()
    if (location?.start?.cfi) {
      const customTitle = window.prompt('书签标题', epubTitle || undefined)
      if (customTitle === null) return
      try {
        const bm = await booksApi.createBookmark(bookId, {
          cfi: location.start.cfi,
          title: customTitle || epubTitle || undefined,
        })
        setEpubBookmarks(prev => [bm, ...prev])
      } catch {}
    }
  }, [bookId, epubTitle])

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isEpub || isPdf) return
    if (isTouchingRef.current) return
    if (pageTurnMode === 'scroll') return
    const selection = window.getSelection()
    if (selection && !selection.isCollapsed) return

    if (pageTurnMode === 'click') {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const width = rect.width

      if (x < width / 3) {
        goPrev()
      } else if (x > width * 2 / 3) {
        goNext()
      } else {
        setShowSettings(false)
      }
    }
  }, [goPrev, goNext, pageTurnMode, isEpub, isPdf])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isEpub || isPdf) return
    const touch = e.touches[0]
    if (!touch) return
    isTouchingRef.current = true
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
    gestureDirRef.current = null
  }, [isEpub, isPdf])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isEpub || isPdf) return
    if (!touchStartRef.current) return
    if (pageTurnMode === 'scroll') return
    const touch = e.touches[0]
    if (!touch) return
    const dx = touch.clientX - touchStartRef.current.x
    const dy = touch.clientY - touchStartRef.current.y

    if (!gestureDirRef.current) {
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
        gestureDirRef.current = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v'
      }
    }

    if (gestureDirRef.current === 'h') {
      e.preventDefault()
      if (pageTurnMode === 'slide') {
        setSlideOffset(dx)
      }
    }
  }, [pageTurnMode, isEpub, isPdf])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (isEpub || isPdf) return
    if (!touchStartRef.current) return
    const dx = e.changedTouches[0]!.clientX - touchStartRef.current.x
    const dy = e.changedTouches[0]!.clientY - touchStartRef.current.y

    if (gestureDirRef.current === 'h' || (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy))) {
      if (pageTurnMode === 'slide') {
        if (Math.abs(dx) > 50) {
          if (dx > 0) goPrev()
          else goNext()
        }
        setSlideOffset(0)
      } else if (pageTurnMode === 'click') {
        if (Math.abs(dx) > 50) {
          if (dx > 0) goPrev()
          else goNext()
        }
      }
    }
    touchStartRef.current = null
    gestureDirRef.current = null
    setTimeout(() => { isTouchingRef.current = false }, 300)
  }, [goPrev, goNext, pageTurnMode, isEpub, isPdf])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isEpub || isPdf) return
    if (pageTurnMode !== 'slide' || isEditing) return
    if (e.button !== 0) return
    const selection = window.getSelection()
    if (selection && !selection.isCollapsed) return
    mouseStartRef.current = { x: e.clientX }
    isDraggingRef.current = true
  }, [pageTurnMode, isEditing, isEpub, isPdf])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isEpub || isPdf) return
    if (!isDraggingRef.current || !mouseStartRef.current) return
    const dx = e.clientX - mouseStartRef.current.x
    setSlideOffset(dx)
  }, [isEpub, isPdf])

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (isEpub || isPdf) return
    if (!isDraggingRef.current || !mouseStartRef.current) return
    const dx = e.clientX - mouseStartRef.current.x
    if (Math.abs(dx) > 50) {
      if (dx > 0) goPrev()
      else goNext()
    }
    setSlideOffset(0)
    mouseStartRef.current = null
    isDraggingRef.current = false
  }, [goPrev, goNext, isEpub, isPdf])

  const handleMouseLeave = useCallback(() => {
    if (isEpub || isPdf) return
    if (isDraggingRef.current) {
      setSlideOffset(0)
      mouseStartRef.current = null
      isDraggingRef.current = false
    }
  }, [isEpub, isPdf])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault()
          goNext()
          break
        case 'ArrowLeft':
          e.preventDefault()
          goPrev()
          break
        case 'PageUp':
          e.preventDefault()
          if (!isEpub && !isPdf) goToPage(currentPage - 1)
          break
        case 'PageDown':
          e.preventDefault()
          if (!isEpub && !isPdf) goToPage(currentPage + 1)
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
        case 'f':
        case 'F':
          e.preventDefault()
          toggleFullscreen()
          break
        case '+':
        case '=':
          if (isPdf) setPdfScale(s => Math.min(s + 0.25, 3))
          break
        case '-':
          if (isPdf) setPdfScale(s => Math.max(s - 0.25, 0.5))
          break
      }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [goNext, goPrev, goToPage, currentPage, onClose, toggleFullscreen, isEpub, isPdf])

  const fetchAnnotations = useCallback(() => {
    annotationsApi.list('book', bookId).then(setAnnotations).catch(() => setAnnotations([]))
  }, [bookId])

  useEffect(() => {
    if (showAnnotations) {
      fetchAnnotations()
    }
  }, [showAnnotations, fetchAnnotations])

  useEffect(() => {
    if (!isEpub && !isPdf) {
      fetchAnnotations()
    }
  }, [isEpub, isPdf, fetchAnnotations])

  useEffect(() => {
    if (showToc && isEpub) {
      fetchEpubBookmarks()
    }
  }, [showToc, isEpub, fetchEpubBookmarks])

  const deleteChapter = useCallback((index: number) => {
    const current = effectiveChapters
    const newChapters = [...current]
    if (newChapters.length <= 1) {
      setCustomChapters([])
      return
    }
    if (index > 0) {
      newChapters[index - 1] = {
        ...newChapters[index - 1]!,
        endPos: newChapters[index]!.endPos,
      }
    } else {
      newChapters[1] = {
        ...newChapters[1]!,
        startPos: 0,
      }
    }
    newChapters.splice(index, 1)
    setCustomChapters(newChapters)
  }, [effectiveChapters])

  const addChapterFromPopup = useCallback(() => {
    if (!selectionPopup) return
    const selectedText = selectionPopup.text.trim()
    if (!selectedText) return

    let startPos = content.indexOf(selectedText)
    if (startPos === -1) {
      const prefix = selectedText.substring(0, Math.min(20, selectedText.length))
      startPos = content.indexOf(prefix)
    }
    if (startPos === -1) {
      let charOffset = 0
      for (let i = 0; i < currentPage && i < pages.length; i++) {
        charOffset += pages[i]?.text?.length || 0
      }
      startPos = charOffset
    }

    const newChapter: ChapterInfo = {
      title: selectedText.substring(0, 50),
      startPos,
      endPos: startPos + selectedText.length,
    }

    const newChapters = [...(customChapters || chapters)]
    newChapters.push(newChapter)
    newChapters.sort((a, b) => a.startPos - b.startPos)
    setCustomChapters(newChapters)
    setSelectionPopup(null)
    window.getSelection()?.removeAllRanges()
  }, [selectionPopup, content, customChapters, chapters, currentPage, pages])

  const handleTextMouseUp = useCallback((e: React.MouseEvent) => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) {
      setSelectionPopup(null)
      return
    }
    const selectedText = selection.toString().trim()
    if (!selectedText || selectedText.length < 2) {
      setSelectionPopup(null)
      return
    }
    const range = selection.getRangeAt(0)
    const rangeRect = range.getBoundingClientRect()
    const containerRect = e.currentTarget.getBoundingClientRect()
    const x = Math.max(0, Math.min(rangeRect.left - containerRect.left + rangeRect.width / 2 - 80, containerRect.width - 180))
    const y = rangeRect.top - containerRect.top - 40
    setSelectionPopup({ x, y: Math.max(0, y), text: selectedText })
  }, [])

  const handleStartEdit = useCallback(() => {
    transitioningRef.current = true
    let charOffset = 0
    for (let i = 0; i < currentPage && i < pages.length; i++) {
      charOffset += pages[i]?.text?.length || 0
    }
    editStartOffsetRef.current = charOffset
    setEditContent(content.slice(charOffset))
    setIsEditing(true)
    transitioningRef.current = false
  }, [content, currentPage, pages])

  const handleSaveEdit = useCallback(async () => {
    transitioningRef.current = true
    setIsEditing(false)
    const fullContent = content.slice(0, editStartOffsetRef.current) + editContent
    setContent(fullContent)
    try {
      await booksApi.saveText(bookId, fullContent)
    } catch {}
    transitioningRef.current = false
  }, [editContent, content, bookId])

  const handleStartEpubEdit = useCallback(async () => {
    if (!renditionRef.current) return
    try {
      const contents = renditionRef.current.getContents()
      if (contents && contents.length > 0) {
        const doc = contents[0].document || contents[0].content
        if (doc) {
          const text = doc.body ? doc.body.innerText : ''
          setEpubEditContent(text)
          setEpubEditMode(true)
        }
      }
    } catch {
      setEpubEditContent('')
      setEpubEditMode(true)
    }
  }, [])

  const handleSaveEpubEdit = useCallback(async () => {
    if (!renditionRef.current) return
    try {
      const contents = renditionRef.current.getContents()
      if (contents && contents.length > 0) {
        const doc = contents[0].document || contents[0].content
        if (doc && doc.body) {
          doc.body.innerText = epubEditContent
        }
      }
    } catch {}
    setEpubEditMode(false)
  }, [epubEditContent])

  const saveChaptersToServer = useCallback(async (chaptersToSave: ChapterInfo[]) => {
    try {
      await booksApi.updateChapters(bookId, chaptersToSave.map((ch, i) => ({
        title: ch.title,
        startPos: ch.startPos,
        endPos: ch.endPos,
        index: i,
      })))
    } catch {}
  }, [bookId])

  useEffect(() => {
    if (customChapters !== null && customChapters.length > 0) {
      saveChaptersToServer(customChapters)
    }
  }, [customChapters, saveChaptersToServer])

  const handleNewAnnotation = useCallback(() => {
    const selection = window.getSelection()
    const selectedText = selection?.toString().trim()
    if (!selectedText) {
      alert('请先选择文本')
      return
    }
    const note = window.prompt('添加批注（可选）')

    let startOffset: number | undefined
    let endOffset: number | undefined
    const idx = content.indexOf(selectedText)
    if (idx >= 0) {
      startOffset = contentOffset + idx
      endOffset = contentOffset + idx + selectedText.length
    } else {
      let charOffset = 0
      for (let i = 0; i < currentPage && i < pages.length; i++) {
        charOffset += pages[i]?.text?.length || 0
      }
      startOffset = contentOffset + charOffset
      endOffset = contentOffset + charOffset + selectedText.length
    }

    annotationsApi.create({
      targetType: 'book',
      targetId: bookId,
      page: currentPage,
      content: selectedText,
      note: note || undefined,
      startOffset,
      endOffset,
    }).then((newAnn) => {
      setAnnotations(prev => [...prev, newAnn])
    }).catch(() => {})
  }, [bookId, currentPage, content, contentOffset, pages])

  const handleDeleteAnnotation = useCallback((id: number) => {
    annotationsApi.delete(id).then(() => {
      setAnnotations(prev => prev.filter(a => a.id !== id))
    }).catch(() => {})
  }, [])

  const handleAnnotationClick = useCallback((ann: Annotation) => {
    if (ann.startOffset != null) {
      const localOffset = ann.startOffset - contentOffset
      if (localOffset >= 0 && localOffset < content.length && pages.length > 0) {
        let cumLen = 0
        for (let i = 0; i < pages.length; i++) {
          if (cumLen >= localOffset) {
            goToPage(i)
            return
          }
          cumLen += pages[i]!.text.length
        }
      }
    }
    goToPage(ann.page)
  }, [contentOffset, content, pages, goToPage])

  if (loading && !isEpub) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: 'var(--bg-base)' }}>
        {loadError ? (
          <div className="text-center space-y-4">
            <p style={{ color: 'var(--color-accent-red)' }} className="text-sm">加载失败，文件可能损坏或格式不支持</p>
            <p style={{ color: 'var(--text-muted)' }} className="text-xs">请检查文件是否完整，或尝试其他阅读器打开</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p style={{ color: 'var(--text-secondary)' }} className="text-sm">{loadingText}</p>
          </div>
        )}
      </div>
    )
  }

  const currentText = pages[currentPage]?.text || ''
  const isScrollMode = pageTurnMode === 'scroll'
  const pageTurnOptions: { value: PageTurnMode; label: string }[] = [
    { value: 'click', label: '点击翻页' },
    { value: 'slide', label: '滑动翻页' },
    { value: 'scroll', label: '滚动翻页' },
  ]

  const renderTocPanel = () => {
    if (isEpub) {
      return (
        <div className="w-56 shrink-0 overflow-y-auto p-3" style={{ borderRight: '1px solid var(--border-default)', backgroundColor: 'var(--bg-surface)' }}>
          <h3 className="mb-2 text-sm font-medium flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
            <BookOpen className="h-3.5 w-3.5" />
            目录
          </h3>
          {epubToc.filter((item: any) => !hiddenTocEntries.has(item.href)).map((item: any, i: number) => (
            <div key={i} className="flex items-center gap-1 group/toc">
              <button
                onClick={() => goToCfi(item.href)}
                className="flex-1 text-left rounded px-2 py-1.5 text-xs truncate"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--text-secondary)' }}
              >
                {item.label}
              </button>
              <button
                onClick={() => setHiddenTocEntries(prev => new Set(prev).add(item.href))}
                className="shrink-0 rounded p-0.5 transition-opacity opacity-0 group-hover/toc:opacity-100"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-red, #ef4444)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {hiddenTocEntries.size > 0 && (
            <button
              onClick={() => setHiddenTocEntries(new Set())}
              className="w-full rounded border border-dashed px-2 py-1.5 text-xs flex items-center justify-center gap-1 transition-colors"
              style={{ borderColor: 'var(--border-light)', color: 'var(--text-muted)' }}
            >
              显示已隐藏条目 ({hiddenTocEntries.size})
            </button>
          )}
          <div className="mt-3 pt-2" style={{ borderTop: '1px solid var(--border-light)' }}>
            <h3 className="mb-2 text-sm font-medium flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
              <Bookmark className="h-3.5 w-3.5" />
              书签 ({epubBookmarks.length})
            </h3>
            <button
              onClick={addEpubBookmark}
              className="mb-2 w-full rounded border border-dashed px-2 py-1.5 text-xs flex items-center justify-center gap-1 transition-colors"
              style={{ borderColor: 'var(--border-light)', color: 'var(--text-muted)' }}
            >
              <Plus className="h-3 w-3" /> 添加书签
            </button>
            {epubBookmarks.map((bm) => (
              <div key={bm.id} className="flex items-center gap-1 group">
                <button
                  onClick={() => goToCfi(bm.cfi)}
                  className="flex-1 text-left rounded px-2 py-1.5 text-xs truncate"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--text-secondary)' }}
                >
                  {bm.title || bm.cfi.slice(0, 30)}
                </button>
                <button
                  onClick={() => deleteEpubBookmark(bm.id)}
                  className="shrink-0 rounded p-0.5 transition-opacity opacity-0 group-hover:opacity-100"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-red, #ef4444)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="w-56 shrink-0 overflow-y-auto p-3" style={{ borderRight: '1px solid var(--border-default)', backgroundColor: 'var(--bg-surface)' }}>
        <h3 className="mb-2 text-sm font-medium flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
          <BookOpen className="h-3.5 w-3.5" />
          目录 ({effectiveChapters.length})
        </h3>
        {effectiveChapters.length === 0 && (
          <p className="text-xs text-center py-3" style={{ color: 'var(--text-muted)' }}>未识别到章节，可手动添加</p>
        )}
        {effectiveChapters.map((ch, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer group/chapter"
            style={{ backgroundColor: currentChapterIndex === i ? 'var(--color-primary)' : 'transparent', color: currentChapterIndex === i ? 'white' : 'var(--text-secondary)' }}
            onClick={() => { goToChapter(i); setShowToc(false) }}
          >
            <span className="flex-1 truncate text-sm">{ch.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                deleteChapter(i)
              }}
              className="shrink-0 rounded p-0.5 transition-opacity opacity-0 group-hover/chapter:opacity-100"
              style={{ color: currentChapterIndex === i ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-red, #ef4444)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = currentChapterIndex === i ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)')}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    )
  }

  const renderContentArea = () => {
    if (isEpub) {
      const bgColor = EPUB_THEMES[epubSettings.theme].body['background-color']
      return (
        <div className="flex-1 relative" style={{ backgroundColor: bgColor }}>
          <div
            ref={epubContainerRef}
            className="h-full w-full"
            style={{
              fontFamily: FONT_FAMILIES.find(f => f.value === epubSettings.fontFamily)?.name,
            }}
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-10" style={{ backgroundColor: bgColor }}>
              {loadError ? (
                <div className="text-center space-y-4">
                  <p style={{ color: 'var(--color-accent-red)' }} className="text-sm">加载失败，文件可能损坏或格式不支持</p>
                  <p style={{ color: 'var(--text-muted)' }} className="text-xs">请检查文件是否完整，或尝试其他阅读器打开</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <p style={{ color: 'var(--text-secondary)' }} className="text-sm">{loadingText}</p>
                </div>
              )}
            </div>
          )}
          {epubEditMode && (
            <div className="absolute inset-0 z-20" style={{ backgroundColor: 'var(--bg-base)' }}>
              <textarea
                value={epubEditContent}
                onChange={(e) => setEpubEditContent(e.target.value)}
                className="w-full h-full p-4 resize-none outline-none"
                style={{
                  fontSize: `${epubSettings.fontSize}px`,
                  lineHeight: epubSettings.lineHeight,
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-base)',
                }}
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <button onClick={handleSaveEpubEdit} className="rounded bg-primary px-3 py-1 text-sm text-white">保存</button>
                <button onClick={() => setEpubEditMode(false)} className="rounded px-3 py-1 text-sm" style={{ color: 'var(--text-secondary)' }}>取消</button>
              </div>
            </div>
          )}
        </div>
      )
    }

    if (isPdf) {
      return (
        <div className="flex-1 overflow-auto flex justify-center p-4">
          <canvas ref={pdfCanvasRef} className="max-w-full" />
        </div>
      )
    }

    if (isEditing) {
      return (
        <div className="flex-1 relative" style={{ backgroundColor: 'var(--bg-base)' }}>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full h-full p-4 resize-none outline-none"
            style={{
              fontSize: `${fontSize}px`,
              lineHeight,
              fontFamily: 'monospace',
              color: 'var(--text-primary)',
              backgroundColor: 'var(--bg-base)',
            }}
          />
        </div>
      )
    }

    return (
      <div
        ref={contentAreaRef}
        className="flex-1 overflow-hidden flex items-center justify-center px-6 py-4 relative"
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div
          ref={scrollRef}
          className={clsx('max-w-3xl w-full px-4', isScrollMode ? 'h-full overflow-y-auto' : 'h-full overflow-hidden')}
          style={{
            fontSize: `${fontSize}px`,
            lineHeight,
            transform: pageTurnMode === 'slide' && slideOffset !== 0 ? `translateX(${slideOffset}px)` : undefined,
            transition: slideOffset === 0 && pageTurnMode === 'slide' ? 'transform 0.2s ease' : undefined,
            userSelect: 'text',
            touchAction: isScrollMode ? 'pan-y' : pageTurnMode === 'slide' ? 'pan-y' : 'manipulation',
            cursor: pageTurnMode === 'slide' && !isEditing ? 'grab' : undefined,
            color: 'var(--text-primary)',
            overflowY: isScrollMode ? 'auto' : 'hidden',
            height: '100%',
          }}
          onMouseUp={!isEpub && !isEditing ? handleTextMouseUp : undefined}
          onScroll={isScrollMode ? () => {
            if (!scrollRef.current) return
            const el = scrollRef.current
            const scrollTop = el.scrollTop
            const estimatedPageHeight = el.scrollHeight / txtTotalPages
            const newPage = Math.min(Math.floor(scrollTop / estimatedPageHeight), txtTotalPages - 1)
            if (newPage !== currentPage && newPage >= 0) {
              setCurrentPage(newPage)
            }
          } : undefined}
        >
          {isScrollMode ? (
            <>
              {pages.map((page, idx) => (
                <div key={idx} className="whitespace-pre-wrap break-words font-sans text-pretty"
                     dangerouslySetInnerHTML={{ __html: getHighlightedHtml(page.text, pageStartOffsets[idx] || 0) }} />
              ))}
            </>
          ) : (
            <div className="whitespace-pre-wrap break-words font-sans text-pretty"
                 dangerouslySetInnerHTML={{ __html: getHighlightedHtml(currentText, pageStartOffsets[currentPage] || 0) }} />
          )}
        </div>

        {selectionPopup && !isEpub && (
          <div
            className="absolute z-50 flex items-center gap-1 rounded-lg px-2 py-1.5 shadow-lg"
            style={{
              left: `${selectionPopup.x}px`,
              top: `${selectionPopup.y}px`,
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
              color: 'var(--text-primary)',
            }}
          >
            <button
              onClick={addChapterFromPopup}
              className="rounded px-2 py-1 text-xs"
              style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
            >
              添加到目录
            </button>
            <button
              onClick={() => { setSelectionPopup(null); window.getSelection()?.removeAllRanges() }}
              className="rounded px-2 py-1 text-xs"
              style={{ color: 'var(--text-secondary)' }}
            >
              取消
            </button>
          </div>
        )}

        {!isScrollMode && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goPrev() }}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-2 transition-colors"
              style={{ backgroundColor: 'var(--overlay)', color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.backgroundColor = 'var(--bg-surface-active)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.backgroundColor = 'var(--overlay)' }}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goNext() }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 transition-colors"
              style={{ backgroundColor: 'var(--overlay)', color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.backgroundColor = 'var(--bg-surface-active)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.backgroundColor = 'var(--overlay)' }}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>
    )
  }

  const renderSettingsPanel = () => {
    if (isEpub) {
      return (
        <div className="absolute top-12 right-3 z-[60] w-72 rounded-lg p-4 shadow-xl space-y-5" style={{ border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-surface)' }}>
          <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>阅读设置</h3>

          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>翻页方式</label>
            <div className="flex gap-2">
              <button
                onClick={() => updateEpubSettings({ flow: 'paginated' })}
                className={`flex-1 rounded px-3 py-1.5 text-xs ${epubSettings.flow === 'paginated' ? 'bg-blue-600 text-white' : ''}`}
                style={epubSettings.flow !== 'paginated' ? { backgroundColor: 'var(--bg-surface-hover)', color: 'var(--text-secondary)' } : undefined}
              >
                翻页模式
              </button>
              <button
                onClick={() => updateEpubSettings({ flow: 'scrolled-doc' })}
                className={`flex-1 rounded px-3 py-1.5 text-xs ${epubSettings.flow === 'scrolled-doc' ? 'bg-blue-600 text-white' : ''}`}
                style={epubSettings.flow !== 'scrolled-doc' ? { backgroundColor: 'var(--bg-surface-hover)', color: 'var(--text-secondary)' } : undefined}
              >
                连续滚动
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>字体大小</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateEpubSettings({ fontSize: Math.max(12, epubSettings.fontSize - 2) })}
                className="rounded px-2 py-1 text-xs disabled:opacity-30"
                style={{ backgroundColor: 'var(--bg-surface-hover)', color: 'var(--text-primary)' }}
                disabled={epubSettings.fontSize <= 12}
              >
                A-
              </button>
              <span className="text-sm min-w-[3rem] text-center" style={{ color: 'var(--text-primary)' }}>{epubSettings.fontSize}px</span>
              <button
                onClick={() => updateEpubSettings({ fontSize: Math.min(32, epubSettings.fontSize + 2) })}
                className="rounded px-2 py-1 text-xs disabled:opacity-30"
                style={{ backgroundColor: 'var(--bg-surface-hover)', color: 'var(--text-primary)' }}
                disabled={epubSettings.fontSize >= 32}
              >
                A+
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>主题</label>
            <div className="flex gap-2">
              {(Object.entries(EPUB_THEMES) as [ReaderSettings['theme'], typeof EPUB_THEMES.dark][]).map(([key, t]) => {
                const Icon = t.icon
                return (
                  <button
                    key={key}
                    onClick={() => updateEpubSettings({ theme: key })}
                    className={`flex-1 rounded px-3 py-1.5 text-xs flex items-center justify-center gap-1.5 ${epubSettings.theme === key ? 'bg-blue-600 text-white' : ''}`}
                    style={epubSettings.theme !== key ? { backgroundColor: 'var(--bg-surface-hover)', color: 'var(--text-secondary)' } : undefined}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {t.name}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
              行间距 <span style={{ color: 'var(--text-muted)' }}>{epubSettings.lineHeight}</span>
            </label>
            <input
              type="range"
              min="1.2"
              max="3"
              step="0.2"
              value={epubSettings.lineHeight}
              onChange={(e) => updateEpubSettings({ lineHeight: parseFloat(e.target.value) })}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-blue-500"
              style={{ backgroundColor: 'var(--bg-surface-active)' }}
            />
            <div className="flex justify-between text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              <span>紧凑</span>
              <span>舒服</span>
            </div>
          </div>

          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>字体</label>
            <div className="flex flex-col gap-1">
              {FONT_FAMILIES.map((ff) => (
                <button
                  key={ff.value}
                  onClick={() => updateEpubSettings({ fontFamily: ff.value })}
                  className={`rounded px-3 py-1.5 text-xs text-left ${epubSettings.fontFamily === ff.value ? 'bg-blue-600 text-white' : ''}`}
                  style={epubSettings.fontFamily !== ff.value ? { backgroundColor: 'var(--bg-surface-hover)', color: 'var(--text-secondary)' } : undefined}
                >
                  {ff.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    }

    if (isPdf) {
      return (
        <div className="absolute top-12 right-3 z-[60] w-60 rounded-lg p-4 shadow-xl" style={{ border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-surface)' }}>
          <h3 className="mb-3 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>阅读设置</h3>
          <div>
            <label className="mb-1 block text-xs" style={{ color: 'var(--text-secondary)' }}>缩放: {Math.round(pdfScale * 100)}%</label>
            <input type="range" min={0.5} max={3} step={0.25} value={pdfScale} onChange={(e) => setPdfScale(parseFloat(e.target.value))} className="w-full accent-primary" />
          </div>
        </div>
      )
    }

    return (
      <div className="absolute top-12 right-3 z-[60] w-60 rounded-lg p-4 shadow-xl" style={{ border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-surface)' }}>
        <h3 className="mb-3 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>阅读设置</h3>

        <div className="mb-3">
          <label className="mb-1.5 block text-xs" style={{ color: 'var(--text-secondary)' }}>翻页方式</label>
          <div className="grid grid-cols-3 gap-1">
            {pageTurnOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setPageTurnMode(opt.value); setSlideOffset(0) }}
                className={clsx(
                  'rounded px-1.5 py-1.5 text-xs transition-colors',
                  pageTurnMode === opt.value ? 'bg-primary text-white' : ''
                )}
                style={pageTurnMode !== opt.value ? { backgroundColor: 'var(--bg-surface-hover)', color: 'var(--text-secondary)' } : undefined}
                onMouseEnter={pageTurnMode !== opt.value ? (e) => (e.currentTarget.style.color = 'var(--text-primary)') : undefined}
                onMouseLeave={pageTurnMode !== opt.value ? (e) => (e.currentTarget.style.color = 'var(--text-secondary)') : undefined}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <label className="mb-1 block text-xs" style={{ color: 'var(--text-secondary)' }}>字体大小: {fontSize}px</label>
          <input type="range" min={14} max={28} value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="w-full accent-primary" />
        </div>
        <div>
          <label className="mb-1 block text-xs" style={{ color: 'var(--text-secondary)' }}>行间距: {lineHeight}</label>
          <input type="range" min={1.2} max={3} step={0.1} value={lineHeight} onChange={(e) => setLineHeight(parseFloat(e.target.value))} className="w-full accent-primary" />
        </div>
      </div>
    )
  }

  const renderFooter = () => {
    if (isEpub) {
      return (
        <div className="flex h-10 shrink-0 items-center justify-between px-4" style={{ borderTop: '1px solid var(--border-default)', backgroundColor: 'var(--bg-surface)' }}>
          <button onClick={goPrev} className="rounded p-1 transition-colors" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}>
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {totalPages > 0 ? `${currentPage} / ${totalPages}` : '加载中...'}
          </span>
          <button onClick={goNext} className="rounded p-1 transition-colors" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )
    }

    if (isPdf) {
      return (
        <div className="flex h-10 shrink-0 items-center justify-between px-4" style={{ borderTop: '1px solid var(--border-default)', backgroundColor: 'var(--bg-surface)' }}>
          <button onClick={goPrev} disabled={currentPage <= 1} className="rounded p-1 transition-colors disabled:opacity-30" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}>
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={currentPage}
              onChange={(e) => {
                const p = parseInt(e.target.value) || 1
                if (p >= 1 && p <= totalPages) renderPdfPage(p)
              }}
              className="w-16 rounded border px-1 py-0.5 text-center text-xs outline-none"
              style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-surface-hover)', color: 'var(--text-primary)' }}
              min={1}
              max={totalPages}
            />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/ {totalPages}</span>
          </div>
          <button onClick={goNext} disabled={currentPage >= totalPages} className="rounded p-1 transition-colors disabled:opacity-30" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )
    }

    return (
      <div className="flex h-10 shrink-0 items-center justify-between px-4" style={{ borderTop: '1px solid var(--border-default)', backgroundColor: 'var(--bg-surface)' }}>
        <button onClick={goPrev} className="rounded p-1 transition-colors" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}>
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          {isScrollMode ? (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>滚动模式</span>
          ) : (
            <>
              {isChapterMode && pages[currentPage]?.chapterTitle && (
                <span className="text-xs max-w-32 truncate" style={{ color: 'var(--text-muted)' }}>
                  {pages[currentPage].chapterTitle}
                </span>
              )}
              <input
                type="number"
                value={currentPage + 1}
                onChange={(e) => goToPage(parseInt(e.target.value) - 1 || 0)}
                className="w-16 rounded border px-1 py-0.5 text-center text-xs outline-none"
                style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-surface-hover)', color: 'var(--text-primary)' }}
                min={1}
                max={txtTotalPages}
              />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/ {txtTotalPages} 页</span>
              <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
                {Math.round((currentPage / Math.max(txtTotalPages - 1, 1)) * 100)}%
              </span>
            </>
          )}
        </div>
        <button onClick={goNext} className="rounded p-1 transition-colors" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    )
  }

  return (
    <div data-theme={theme} className="flex h-screen flex-col select-none relative" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="flex h-10 shrink-0 items-center justify-between px-4" style={{ borderBottom: '1px solid var(--border-default)', backgroundColor: 'var(--bg-surface)' }}>
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="rounded p-1 transition-colors" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}>
            <X className="h-5 w-5" />
          </button>
          {isEpub && !loading && (
            <span className="text-sm truncate max-w-[30%]" style={{ color: 'var(--text-secondary)' }}>{epubTitle}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowToc(!showToc)} className={clsx('rounded p-1 transition-colors', showToc && 'text-primary')} style={!showToc ? { color: 'var(--text-secondary)' } : undefined} onMouseEnter={!showToc ? (e) => (e.currentTarget.style.color = 'var(--text-primary)') : undefined} onMouseLeave={!showToc ? (e) => (e.currentTarget.style.color = 'var(--text-secondary)') : undefined} title="目录">
            <List className="h-4 w-4" />
          </button>
          {!isEpub && !isPdf && (
            <button onClick={() => setShowAnnotations(!showAnnotations)} className={clsx('rounded p-1 transition-colors', showAnnotations && 'text-primary')} style={!showAnnotations ? { color: 'var(--text-secondary)' } : undefined} onMouseEnter={!showAnnotations ? (e) => (e.currentTarget.style.color = 'var(--text-primary)') : undefined} onMouseLeave={!showAnnotations ? (e) => (e.currentTarget.style.color = 'var(--text-secondary)') : undefined} title="批注">
              <Highlighter className="h-4 w-4" />
            </button>
          )}
          {isEpub && !loading && (
            <button onClick={addBookmark} className="rounded p-1 transition-colors" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')} title="添加书签">
              <Bookmark className="h-4 w-4" />
            </button>
          )}
          {isEpub && !loading && (
            <button onClick={handleStartEpubEdit} className="rounded p-1 transition-colors" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')} title="编辑文本">
              <Edit3 className="h-4 w-4" />
            </button>
          )}
          {!isEpub && !isPdf && (
            isEditing ? (
              <button onClick={handleSaveEdit} disabled={isSaving} className="rounded p-1 text-green-400 hover:text-green-300 transition-colors" title="保存">
                <Save className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={handleStartEdit} className="rounded p-1 transition-colors" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')} title="编辑文本">
                <Edit3 className="h-4 w-4" />
              </button>
            )
          )}
          <button onClick={() => setShowSettings(!showSettings)} className="rounded p-1 transition-colors" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')} title="设置">
            <Settings className="h-4 w-4" />
          </button>
          <button onClick={toggleFullscreen} className="rounded p-1 transition-colors" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')} title="全屏">
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {showToc && renderTocPanel()}

        {renderContentArea()}

        {showAnnotations && !isEpub && !isPdf && (
          <div className="w-64 shrink-0 overflow-y-auto p-3" style={{ borderLeft: '1px solid var(--border-default)', backgroundColor: 'var(--bg-surface)' }}>
            <h3 className="mb-2 text-sm font-medium flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
              <Highlighter className="h-3.5 w-3.5" />
              批注 ({annotations.length})
            </h3>
            <button
              onClick={handleNewAnnotation}
              className="mb-2 w-full rounded bg-primary/20 px-2 py-1.5 text-xs text-primary hover:bg-primary/30 flex items-center justify-center gap-1"
            >
              <Plus className="h-3 w-3" /> 新建批注
            </button>
            {annotations.length === 0 && (
              <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>暂无批注</p>
            )}
            {annotations.map(ann => (
              <div key={ann.id} className="mb-2 rounded p-2 cursor-pointer" style={{ backgroundColor: 'var(--bg-surface-hover)' }} onClick={() => handleAnnotationClick(ann)}>
                <p className="text-xs line-clamp-2" style={{ color: 'var(--text-primary)' }}>{ann.content}</p>
                {ann.note && <p className="mt-1 text-xs italic" style={{ color: 'var(--text-muted)' }}>{ann.note}</p>}
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>第{ann.page + 1}页</span>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteAnnotation(ann.id) }} className="transition-colors" style={{ color: 'var(--text-muted)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-red, #ef4444)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}>
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {renderFooter()}

      {showSettings && renderSettingsPanel()}

      {boundaryMsg && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg px-4 py-2 text-sm shadow-lg z-50 pointer-events-none" style={{ border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
          {boundaryMsg}
        </div>
      )}
    </div>
  )
}
