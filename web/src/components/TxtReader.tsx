import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { booksApi, annotationsApi, bookRatingsApi } from '@/services/api'
import { X, Settings, Maximize, Minimize, List, ChevronLeft, ChevronRight, BookOpen, Highlighter, Plus, Edit3, Save } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import clsx from 'clsx'

interface TxtReaderProps {
  bookId: number
  initialChapter?: number
  onClose: () => void
  onChaptersChange?: (chapters: ChapterInfo[]) => void
  onChapterSelect?: (chapterIndex: number) => void
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
  createdAt: string
  updatedAt: string
}

interface PageInfo {
  chapterIndex: number
  text: string
  chapterTitle: string
}

type PageTurnMode = 'click' | 'scroll' | 'slide'

export function TxtReader({ bookId, initialChapter, onClose, onChaptersChange, onChapterSelect }: TxtReaderProps) {
  const theme = useAppStore((s) => s.theme)

  const savedPrefs = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('txtReaderPrefs') || '{}') } catch { return {} }
  }, [])

  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [fontSize, setFontSize] = useState(savedPrefs.fontSize || 16)
  const [lineHeight, setLineHeight] = useState(savedPrefs.lineHeight || 1.8)
  const [showSettings, setShowSettings] = useState(false)
  const [showToc, setShowToc] = useState(false)
  const [showAnnotations, setShowAnnotations] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageTurnMode, setPageTurnMode] = useState<PageTurnMode>(savedPrefs.pageTurnMode || 'click')
  const [slideOffset, setSlideOffset] = useState(0)
  const [customChapters, setCustomChapters] = useState<ChapterInfo[] | null>(() => {
    try {
      const saved = localStorage.getItem(`txtChapters_${bookId}`)
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [selectingChapter, setSelectingChapter] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [boundaryMsg, setBoundaryMsg] = useState<string | null>(null)
  const [charsPerPage, setCharsPerPage] = useState(2000)
  const contentAreaRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const touchedRef = useRef(false)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const isTouchingRef = useRef(false)
  const gestureDirRef = useRef<'h' | 'v' | null>(null)
  const mouseStartRef = useRef<{ x: number } | null>(null)
  const isDraggingRef = useRef(false)
  const initialPageSetRef = useRef(false)
  const readingStatusRef = useRef<'unread' | 'reading' | 'read'>('unread')

  useEffect(() => {
    localStorage.setItem('txtReaderPrefs', JSON.stringify({ pageTurnMode, fontSize, lineHeight }))
  }, [pageTurnMode, fontSize, lineHeight])

  useEffect(() => {
    if (contentAreaRef.current) {
      const height = contentAreaRef.current.clientHeight || window.innerHeight - 160
      const currentFontSize = fontSize
      const currentLineHeight = lineHeight
      const linesPerPage = Math.floor(height / (currentFontSize * currentLineHeight))
      const charsPerLine = Math.floor((contentAreaRef.current.clientWidth || 700) / (currentFontSize * 0.6))
      setCharsPerPage(Math.max(500, linesPerPage * charsPerLine * 0.8))
    }
  }, [fontSize, lineHeight])

  useEffect(() => {
    if (customChapters !== null) {
      localStorage.setItem(`txtChapters_${bookId}`, JSON.stringify(customChapters))
    }
  }, [customChapters, bookId])

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`${booksApi.getFileUrl(bookId)}?t=${Date.now()}`)
        const buffer = await response.arrayBuffer()
        const uint8 = new Uint8Array(buffer)
        let text: string
        try {
          text = new TextDecoder('utf-8', { fatal: true }).decode(uint8)
        } catch {
          text = new TextDecoder('gbk').decode(uint8)
        }
        const cjkCount = (text.match(/[\u4e00-\u9fff]/g) || []).length
        const replacementCount = (text.match(/\uFFFD/g) || []).length
        if (cjkCount > 0 && replacementCount > cjkCount * 0.1) {
          text = new TextDecoder('gbk').decode(uint8)
        }
        setContent(text)
      } catch {
        setContent('文件加载失败')
      } finally {
        setLoading(false)
      }
    }
    fetchContent()
  }, [bookId])

  const chapters = useMemo<ChapterInfo[]>(() => {
    if (!content) return []

    const lines = content.split('\n')
    const lineIndexToCharPos: number[] = []
    let charPos = 0
    for (const line of lines) {
      lineIndexToCharPos.push(charPos)
      charPos += line.length + 1
    }

    const chinesePatterns = [
      /^第[零一二三四五六七八九十百千万\d]+[章节回卷集部篇话]/,
      /^Chapter\s+\d+/i,
      /^卷[零一二三四五六七八九十百千万\d]+/,
      /^序[章言篇]/,
      /^(前言|引言|引子|导读)/,
      /^(后记|后序|尾声|终章|完结篇?|写在最后)/,
      /^(番外[篇章]?|附录)/,
      /^[【[]第[零一二三四五六七八九十百千万\d]+[章节回卷集部篇话][】\]]/,
      /^[【[]\d+[】\]]/,
      /^第[零一二三四五六七八九十百千万\d]+[部分]/,
    ]

    const midSentencePunc = /[，。！？]/
    const MIN_GAP = 200
    const matches: { title: string; startPos: number }[] = []

    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i]!.trim()
      if (trimmed.length === 0) continue

      let patternMatched = false

      for (const pat of chinesePatterns) {
        const m = trimmed.match(pat)
        if (m) {
          patternMatched = true
          if (trimmed.length >= 60) break
          if (midSentencePunc.test(trimmed.slice(m[0].length))) break

          const pos = lineIndexToCharPos[i]!
          const lastMatch = matches[matches.length - 1]
          if (lastMatch && pos - lastMatch.startPos < MIN_GAP) break

          matches.push({ title: trimmed.slice(0, 60), startPos: pos })
          break
        }
      }

      if (patternMatched) continue

      const simpleChapterMatch = trimmed.match(/^(\d{1,4}[\.、\s])/)
      if (simpleChapterMatch && trimmed.length < 40) {
        if (midSentencePunc.test(trimmed.slice(simpleChapterMatch[0].length))) continue
        if (i > 0) {
          const prevTrimmed = lines[i - 1]!.trim()
          if (prevTrimmed.length > 5) continue
        }
        if (trimmed.match(/^[=\-*#~]{3,}\s*$/)) continue

        const pos = lineIndexToCharPos[i]!
        const lastMatch = matches[matches.length - 1]
        if (lastMatch && pos - lastMatch.startPos < MIN_GAP) continue

        matches.push({ title: trimmed.slice(0, 60), startPos: pos })
      }
    }

    if (matches.length === 0) return []

    const adjustedMatches = matches.map(match => {
      let startPos = match.startPos
      const contentAtPos = content.slice(startPos, startPos + match.title.length + 5)
      if (!contentAtPos.includes(match.title)) {
        const searchStart = Math.max(0, startPos - 20)
        const idx = content.indexOf(match.title, searchStart)
        if (idx >= 0 && idx <= startPos + 20) {
          startPos = idx
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

  const pages = useMemo(() => {
    if (!content) return [{ chapterIndex: -1, text: '', chapterTitle: '' }]

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

  const totalPages = pages.length || 1
  const isChapterMode = effectiveChapters.length > 0
  const currentChapterIndex = pages[currentPage]?.chapterIndex ?? -1

  useEffect(() => {
    if (totalPages > 0 && currentPage >= totalPages) {
      setCurrentPage(Math.max(0, totalPages - 1))
    }
  }, [totalPages])

  useEffect(() => {
    if (content && totalPages > 0 && !initialPageSetRef.current) {
      initialPageSetRef.current = true
      if (initialChapter !== undefined && initialChapter >= 0) {
        const pageIndex = pages.findIndex(p => p.chapterIndex === initialChapter)
        if (pageIndex >= 0) {
          setCurrentPage(pageIndex)
        }
      } else {
        booksApi.getProgress(bookId).then((progress) => {
          if (progress?.currentPage && progress.currentPage > 0) {
            setCurrentPage(Math.min(progress.currentPage, totalPages - 1))
          }
        }).catch(() => {})
      }
    }
  }, [content, totalPages, bookId, initialChapter, pages])

  const saveProgress = useCallback(() => {
    if (totalPages > 0 && content) {
      const pct = Math.round((currentPage / totalPages) * 10000) / 100
      booksApi.updateProgress(bookId, { percentage: pct, currentPage, totalPages }).catch(() => {})
    }
  }, [bookId, currentPage, totalPages, content])

  const goNext = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(p => p + 1)
      setSlideOffset(0)
    } else {
      setBoundaryMsg('已读完')
    }
  }, [currentPage, totalPages])

  const goPrev = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage(p => p - 1)
      setSlideOffset(0)
    } else {
      setBoundaryMsg('已到起始页')
    }
  }, [currentPage])

  const goToPage = useCallback((p: number) => {
    const target = Math.max(0, Math.min(Math.floor(p), totalPages - 1))
    setCurrentPage(target)
    setSlideOffset(0)
  }, [totalPages])

  const goToChapter = useCallback((chapterIndex: number) => {
    const pageIndex = pages.findIndex(p => p.chapterIndex === chapterIndex)
    if (pageIndex >= 0) {
      setCurrentPage(pageIndex)
      setSlideOffset(0)
    }
    onChapterSelect?.(chapterIndex)
    setShowToc(false)
  }, [pages, onChapterSelect])

  useEffect(() => {
    if (touchedRef.current) {
      saveProgress()
    }
    touchedRef.current = true
  }, [currentPage])

  useEffect(() => {
    if (pageTurnMode !== 'scroll' && scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [currentPage, pageTurnMode])

  useEffect(() => {
    if (boundaryMsg) {
      const timer = setTimeout(() => setBoundaryMsg(null), 1500)
      return () => clearTimeout(timer)
    }
  }, [boundaryMsg])

  useEffect(() => {
    if (content && currentPage > 0 && readingStatusRef.current === 'unread') {
      readingStatusRef.current = 'reading'
      bookRatingsApi.get(bookId).then(rating => {
        bookRatingsApi.set(bookId, rating?.score ?? 0, 'reading').catch(() => {})
      }).catch(() => {
        bookRatingsApi.set(bookId, 0, 'reading').catch(() => {})
      })
    }
  }, [content, currentPage, bookId])

  useEffect(() => {
    if (content && currentPage >= totalPages - 1 && totalPages > 1 && readingStatusRef.current !== 'read') {
      readingStatusRef.current = 'read'
      bookRatingsApi.get(bookId).then(rating => {
        bookRatingsApi.set(bookId, rating?.score ?? 0, 'read').catch(() => {})
      }).catch(() => {
        bookRatingsApi.set(bookId, 0, 'read').catch(() => {})
      })
    }
  }, [content, currentPage, totalPages, bookId])

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchingRef.current) return
    if (pageTurnMode === 'scroll') return

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
  }, [goPrev, goNext, pageTurnMode])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    if (!touch) return
    isTouchingRef.current = true
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
    gestureDirRef.current = null
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
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
  }, [pageTurnMode])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
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
  }, [goPrev, goNext, pageTurnMode])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (pageTurnMode !== 'slide' || isEditing) return
    if (e.button !== 0) return
    mouseStartRef.current = { x: e.clientX }
    isDraggingRef.current = true
  }, [pageTurnMode, isEditing])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingRef.current || !mouseStartRef.current) return
    const dx = e.clientX - mouseStartRef.current.x
    setSlideOffset(dx)
  }, [])

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isDraggingRef.current || !mouseStartRef.current) return
    const dx = e.clientX - mouseStartRef.current.x
    if (Math.abs(dx) > 50) {
      if (dx > 0) goPrev()
      else goNext()
    }
    setSlideOffset(0)
    mouseStartRef.current = null
    isDraggingRef.current = false
  }, [goPrev, goNext])

  const handleMouseLeave = useCallback(() => {
    if (isDraggingRef.current) {
      setSlideOffset(0)
      mouseStartRef.current = null
      isDraggingRef.current = false
    }
  }, [])

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
          goToPage(currentPage - 1)
          break
        case 'PageDown':
          e.preventDefault()
          goToPage(currentPage + 1)
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
      }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [goNext, goPrev, goToPage, currentPage, onClose, toggleFullscreen])

  const fetchAnnotations = useCallback(() => {
    annotationsApi.list('book', bookId).then(setAnnotations).catch(() => setAnnotations([]))
  }, [bookId])

  useEffect(() => {
    if (showAnnotations) {
      fetchAnnotations()
    }
  }, [showAnnotations, fetchAnnotations])

  const deleteChapter = useCallback((index: number) => {
    const current = effectiveChapters
    const newChapters = [...current]
    if (newChapters.length <= 1) {
      setCustomChapters([])
      onChaptersChange?.([])
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
    onChaptersChange?.(newChapters)
  }, [effectiveChapters, onChaptersChange])

  const addChapterFromSelection = useCallback(() => {
    const selection = window.getSelection()
    const selectedText = selection?.toString().trim()
    if (!selectedText) {
      alert('请先选择文本')
      return
    }

    const current = effectiveChapters
    const searchStart = currentChapterIndex >= 0 && current[currentChapterIndex]
      ? current[currentChapterIndex]!.startPos
      : 0
    const searchEnd = currentChapterIndex >= 0 && current[currentChapterIndex]
      ? current[currentChapterIndex]!.endPos
      : content.length

    const idx = content.indexOf(selectedText, searchStart)
    if (idx < 0 || idx >= searchEnd) {
      alert('未找到选中文字的位置')
      return
    }

    const title = window.prompt('章节标题', selectedText.slice(0, 60))
    if (!title) return

    if (current.length === 0) {
      const newChapters: ChapterInfo[] = []
      if (idx > 0) {
        newChapters.push({ title: '开头', startPos: 0, endPos: idx })
      }
      newChapters.push({ title, startPos: idx, endPos: content.length })
      setCustomChapters(newChapters)
      onChaptersChange?.(newChapters)
      return
    }

    const chapterIdx = current.findIndex(ch => idx >= ch.startPos && idx < ch.endPos)
    if (chapterIdx === -1) return

    const chapter = current[chapterIdx]!
    if (idx <= chapter.startPos) return

    const newChapters = [...current]
    newChapters[chapterIdx] = { ...chapter, endPos: idx }
    newChapters.splice(chapterIdx + 1, 0, { title, startPos: idx, endPos: chapter.endPos })

    setCustomChapters(newChapters)
    onChaptersChange?.(newChapters)
  }, [currentChapterIndex, effectiveChapters, content, onChaptersChange])

  const handleNewAnnotation = useCallback(() => {
    const selection = window.getSelection()
    const selectedText = selection?.toString().trim()
    if (!selectedText) {
      alert('请先选择文本')
      return
    }
    const note = window.prompt('添加批注（可选）')
    annotationsApi.create({
      targetType: 'book',
      targetId: bookId,
      page: currentPage,
      content: selectedText,
      note: note || undefined,
    }).then((newAnn) => {
      setAnnotations(prev => [...prev, newAnn])
    }).catch(() => {})
  }, [bookId, currentPage])

  const handleDeleteAnnotation = useCallback((id: number) => {
    annotationsApi.delete(id).then(() => {
      setAnnotations(prev => prev.filter(a => a.id !== id))
    }).catch(() => {})
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: 'var(--bg-base)' }}>
        <div className="animate-spin h-8 w-8 rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const currentText = pages[currentPage]?.text || ''

  const pageTurnOptions: { value: PageTurnMode; label: string }[] = [
    { value: 'click', label: '点击翻页' },
    { value: 'slide', label: '滑动翻页' },
    { value: 'scroll', label: '滚动翻页' },
  ]

  const isScrollMode = pageTurnMode === 'scroll'

  return (
    <div data-theme={theme} className="flex h-screen flex-col select-none relative" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="flex h-10 shrink-0 items-center justify-between px-4" style={{ borderBottom: '1px solid var(--border-default)', backgroundColor: 'var(--bg-surface)' }}>
        <button onClick={onClose} className="rounded p-1 transition-colors" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}>
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowToc(!showToc)} className={clsx('rounded p-1 transition-colors', showToc && 'text-primary')} style={!showToc ? { color: 'var(--text-secondary)' } : undefined} onMouseEnter={!showToc ? (e) => (e.currentTarget.style.color = 'var(--text-primary)') : undefined} onMouseLeave={!showToc ? (e) => (e.currentTarget.style.color = 'var(--text-secondary)') : undefined} title="目录">
            <List className="h-4 w-4" />
          </button>
          <button onClick={() => setShowAnnotations(!showAnnotations)} className={clsx('rounded p-1 transition-colors', showAnnotations && 'text-primary')} style={!showAnnotations ? { color: 'var(--text-secondary)' } : undefined} onMouseEnter={!showAnnotations ? (e) => (e.currentTarget.style.color = 'var(--text-primary)') : undefined} onMouseLeave={!showAnnotations ? (e) => (e.currentTarget.style.color = 'var(--text-secondary)') : undefined} title="批注">
            <Highlighter className="h-4 w-4" />
          </button>
          {isEditing ? (
            <button onClick={async () => {
              setIsSaving(true)
              try {
                await booksApi.saveText(bookId, editContent)
                setContent(editContent)
                setIsEditing(false)
              } catch { alert('保存失败') }
              finally { setIsSaving(false) }
            }} disabled={isSaving} className="rounded p-1 text-green-400 hover:text-green-300 transition-colors" title="保存">
              <Save className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={() => { setEditContent(content); setIsEditing(true) }} className="rounded p-1 transition-colors" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')} title="编辑文本">
              <Edit3 className="h-4 w-4" />
            </button>
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
        {showToc && (
          <div className="w-56 shrink-0 overflow-y-auto p-3" style={{ borderRight: '1px solid var(--border-default)', backgroundColor: 'var(--bg-surface)' }}>
            <h3 className="mb-2 text-sm font-medium flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
              <BookOpen className="h-3.5 w-3.5" />
              目录 ({effectiveChapters.length})
            </h3>
            {effectiveChapters.length === 0 && (
              <p className="text-xs text-center py-3" style={{ color: 'var(--text-muted)' }}>未识别到章节，可手动添加</p>
            )}
            {effectiveChapters.map((ch, i) => (
              <div key={i} className="flex items-center gap-1 group">
                <button
                  onClick={() => goToChapter(i)}
                  className={clsx(
                    'flex-1 text-left rounded px-2 py-1.5 text-xs truncate transition-colors',
                    currentChapterIndex === i ? 'bg-primary/20 text-primary' : ''
                  )}
                  style={currentChapterIndex !== i ? { color: 'var(--text-secondary)' } : undefined}
                  onMouseEnter={(e) => {
                    if (currentChapterIndex !== i) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'
                      e.currentTarget.style.color = 'var(--text-primary)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentChapterIndex !== i) {
                      e.currentTarget.style.backgroundColor = ''
                      e.currentTarget.style.color = 'var(--text-secondary)'
                    }
                  }}
                >
                  {ch.title}
                </button>
                <button
                  onClick={() => deleteChapter(i)}
                  className="shrink-0 rounded p-0.5 transition-opacity opacity-0 group-hover:opacity-100"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-red, #ef4444)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                  title="删除章节"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <div className="mt-2">
              <button
                onClick={() => setSelectingChapter(true)}
                className="w-full rounded border border-dashed px-2 py-1.5 text-xs flex items-center justify-center gap-1 transition-colors"
                style={{ borderColor: 'var(--border-light)', color: 'var(--text-muted)' }}
              >
                <Plus className="h-3 w-3" /> 添加章节
              </button>
            </div>
          </div>
        )}

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
            className={clsx('max-w-3xl w-full px-4', isScrollMode ? 'h-full overflow-y-auto' : 'h-full overflow-y-auto')}
            style={{
              fontSize: `${fontSize}px`,
              lineHeight,
              transform: pageTurnMode === 'slide' && slideOffset !== 0 ? `translateX(${slideOffset}px)` : undefined,
              transition: slideOffset === 0 && pageTurnMode === 'slide' ? 'transform 0.2s ease' : undefined,
              userSelect: isScrollMode || showAnnotations || selectingChapter ? 'text' : 'none',
              touchAction: isScrollMode ? 'pan-y' : pageTurnMode === 'slide' ? 'pan-y' : 'manipulation',
              cursor: pageTurnMode === 'slide' && !isEditing ? 'grab' : undefined,
              color: 'var(--text-primary)',
            }}
            onScroll={isScrollMode ? () => {
              if (!scrollRef.current) return
              const el = scrollRef.current
              const scrollTop = el.scrollTop
              const estimatedPageHeight = el.scrollHeight / totalPages
              const newPage = Math.min(Math.floor(scrollTop / estimatedPageHeight), totalPages - 1)
              if (newPage !== currentPage && newPage >= 0) {
                setCurrentPage(newPage)
              }
            } : undefined}
          >
            {selectingChapter && (
              <div className="sticky top-0 z-20 flex items-center gap-2 rounded-lg px-3 py-2 mb-2 shadow-lg" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-light)' }}>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>选择文本后点击确认</span>
                <button
                  onClick={() => {
                    addChapterFromSelection()
                    setSelectingChapter(false)
                  }}
                  className="rounded bg-primary px-2 py-1 text-xs text-white"
                >
                  确认
                </button>
                <button
                  onClick={() => setSelectingChapter(false)}
                  className="rounded px-2 py-1 text-xs"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  取消
                </button>
              </div>
            )}
            {isEditing ? (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full h-full bg-transparent whitespace-pre-wrap break-words font-sans resize-none outline-none"
                style={{ fontSize: `${fontSize}px`, lineHeight, color: 'var(--text-primary)' }}
              />
            ) : isScrollMode ? (
              <>
                {pages.map((page, idx) => (
                  <pre key={idx} className="whitespace-pre-wrap break-words font-sans text-pretty">
                    {page.text}
                  </pre>
                ))}
              </>
            ) : (
              <pre className="whitespace-pre-wrap break-words font-sans text-pretty">
                {currentText}
              </pre>
            )}
          </div>

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

        {showAnnotations && (
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
              <div key={ann.id} className="mb-2 rounded p-2" style={{ backgroundColor: 'var(--bg-surface-hover)' }}>
                <p className="text-xs line-clamp-2" style={{ color: 'var(--text-primary)' }}>{ann.content}</p>
                {ann.note && <p className="mt-1 text-xs italic" style={{ color: 'var(--text-muted)' }}>{ann.note}</p>}
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>第{ann.page + 1}页</span>
                  <button onClick={() => handleDeleteAnnotation(ann.id)} className="transition-colors" style={{ color: 'var(--text-muted)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-red, #ef4444)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}>
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
                max={totalPages}
              />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/ {totalPages} 页</span>
              <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
                {Math.round((currentPage / Math.max(totalPages - 1, 1)) * 100)}%
              </span>
            </>
          )}
        </div>
        <button onClick={goNext} className="rounded p-1 transition-colors" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {showSettings && (
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
      )}

      {boundaryMsg && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg px-4 py-2 text-sm shadow-lg z-50 pointer-events-none" style={{ border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
          {boundaryMsg}
        </div>
      )}
    </div>
  )
}
