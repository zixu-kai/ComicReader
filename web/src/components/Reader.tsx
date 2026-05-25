import { useEffect, useCallback, useRef, useState, useMemo } from 'react'
import { useReaderStore } from '@/stores/readerStore'
import { useKeyboard } from '@/hooks/useKeyboard'
import { chaptersApi, progressApi } from '@/services/api'
import type { Chapter, ReadingDirection } from '@/types'
import { useNavigate } from 'react-router'
import { X, Settings, ChevronLeft, ChevronRight, Maximize, Minimize, Edit3, Trash2, ImagePlus, Save, RotateCcw, List, BookmarkPlus, Pencil } from 'lucide-react'

type ReaderMode = 'single' | 'double' | 'scroll' | 'slide'

interface ReaderProps {
  comicId: number
  chapterId: number
  totalPages: number
  onClose: () => void
}

type VirtualPage = {
  type: 'original'
  pageNum: number
} | {
  type: 'inserted'
  tempId: string
  dataUrl: string
  file: File
}

interface TocEntry {
  title: string
  page: number
  isCustom?: boolean
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function Reader({ comicId, chapterId, totalPages, onClose }: ReaderProps) {
  const navigate = useNavigate()
  const savedPrefs = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('ownShelfPrefs') || '{}') } catch { return {} }
  }, [])

  const {
    currentPage,
    readingDirection,
    zoom,
    setReadingDirection,
    setZoom,
    goToPage,
    toggleFullscreen,
    saveProgress,
  } = useReaderStore()

  const [readerMode, setReaderMode] = useState<ReaderMode>(savedPrefs.readerMode || 'single')
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())
  const [showSettings, setShowSettings] = useState(false)
  const [showToc, setShowToc] = useState(false)
  const [allChapters, setAllChapters] = useState<Chapter[]>([])
  const [boundaryMsg, setBoundaryMsg] = useState<string | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const [editMode, setEditMode] = useState(false)
  const [pageList, setPageList] = useState<VirtualPage[]>([])
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedPageIdx, setSelectedPageIdx] = useState(0)

  const [customToc, setCustomToc] = useState<TocEntry[]>(() => {
    try {
      const saved = localStorage.getItem(`comicToc_${comicId}_${chapterId}`)
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })

  const boundaryTriggeredRef = useRef<'next' | 'prev' | null>(null)
  const boundaryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const editModeRef = useRef(false)
  editModeRef.current = editMode

  const touchStartRef = useRef<{ x: number; y: number; pageX: number } | null>(null)
  const isSwipingRef = useRef(false)
  const scrollTouchStartRef = useRef(0)
  const lastScrollTimeRef = useRef(0)
  const cacheBuster = useRef(Date.now())

  const effectiveTotalPages = editMode ? pageList.length : totalPages

  useEffect(() => {
    localStorage.setItem('ownShelfPrefs', JSON.stringify({ readerMode, readingDirection }))
  }, [readerMode, readingDirection])

  useEffect(() => {
    localStorage.setItem(`comicToc_${comicId}_${chapterId}`, JSON.stringify(customToc))
  }, [customToc, comicId, chapterId])

  useEffect(() => {
    const initChapter = async () => {
      let startPage: number | undefined
      const params = new URLSearchParams(window.location.search)
      const pageParam = params.get('page')

      if (pageParam === 'last') {
        startPage = totalPages
      } else {
        try {
          const progress = await progressApi.get(comicId)
          if (progress && progress.chapterId === chapterId) {
            startPage = progress.currentPage
          }
        } catch {}
      }
      useReaderStore.getState().openChapter(comicId, chapterId, totalPages, startPage)
      if (savedPrefs.readingDirection) {
        useReaderStore.getState().setReadingDirection(savedPrefs.readingDirection)
      }
    }
    initChapter()
  }, [comicId, chapterId, totalPages])

  useEffect(() => {
    setImageErrors(new Set())
  }, [chapterId])

  useEffect(() => {
    chaptersApi.list(comicId).then(setAllChapters).catch(() => {})
  }, [comicId])

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const isScrollMode = readerMode === 'scroll'
  const isSlideMode = readerMode === 'slide'

  const handleNextChapter = useCallback(() => {
    if (allChapters.length === 0) return
    const currentIndex = allChapters.findIndex(ch => ch.id === chapterId)
    if (currentIndex >= 0 && currentIndex < allChapters.length - 1) {
      const nextCh = allChapters[currentIndex + 1]
      if (nextCh) {
        navigate(`/reader/${comicId}/${nextCh.id}`)
      }
    } else {
      setBoundaryMsg('已读完最后一章')
    }
  }, [allChapters, chapterId, comicId, navigate])

  const handlePrevChapter = useCallback(() => {
    if (allChapters.length === 0) return
    const currentIndex = allChapters.findIndex(ch => ch.id === chapterId)
    if (currentIndex > 0) {
      const prevCh = allChapters[currentIndex - 1]
      if (prevCh) {
        navigate(`/reader/${comicId}/${prevCh.id}?page=last`)
      }
    } else {
      setBoundaryMsg('已是第一章')
    }
  }, [allChapters, chapterId, comicId, navigate])

  const handleNextPage = useCallback(() => {
    if (editModeRef.current) return
    const step = readerMode === 'double' ? 2 : 1
    const nextPageNum = currentPage + step
    if (nextPageNum > effectiveTotalPages) {
      if (boundaryTriggeredRef.current === 'next') {
        handleNextChapter()
        boundaryTriggeredRef.current = null
      } else {
        setBoundaryMsg('已到本章末尾，再次翻页进入下一章')
        boundaryTriggeredRef.current = 'next'
        if (boundaryTimerRef.current) clearTimeout(boundaryTimerRef.current)
        boundaryTimerRef.current = setTimeout(() => {
          boundaryTriggeredRef.current = null
        }, 5000)
      }
    } else {
      goToPage(nextPageNum)
      boundaryTriggeredRef.current = null
    }
  }, [readerMode, currentPage, effectiveTotalPages, editModeRef, goToPage, handleNextChapter])

  const handlePrevPage = useCallback(() => {
    if (editModeRef.current) return
    const step = readerMode === 'double' ? 2 : 1
    const prevPageNum = currentPage - step
    if (prevPageNum < 1) {
      if (boundaryTriggeredRef.current === 'prev') {
        handlePrevChapter()
        boundaryTriggeredRef.current = null
      } else {
        setBoundaryMsg('已到本章开头，再次翻页进入上一章')
        boundaryTriggeredRef.current = 'prev'
        if (boundaryTimerRef.current) clearTimeout(boundaryTimerRef.current)
        boundaryTimerRef.current = setTimeout(() => {
          boundaryTriggeredRef.current = null
        }, 5000)
      }
    } else {
      goToPage(Math.max(1, prevPageNum))
      boundaryTriggeredRef.current = null
    }
  }, [readerMode, currentPage, editModeRef, goToPage, handlePrevChapter])

  useEffect(() => {
    if (boundaryMsg) {
      const timer = setTimeout(() => setBoundaryMsg(null), 1500)
      return () => clearTimeout(timer)
    }
  }, [boundaryMsg])

  const handleContentClick = useCallback((e: React.MouseEvent) => {
    if (editModeRef.current) return
    if (isScrollMode) return
    if (isSlideMode) return
    if (isSwipingRef.current) { isSwipingRef.current = false; return }

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const width = rect.width
    const clickZone = width / 3

    if (x < clickZone) {
      readingDirection === 'rtl' ? handleNextPage() : handlePrevPage()
    } else if (x > width - clickZone) {
      readingDirection === 'rtl' ? handlePrevPage() : handleNextPage()
    }
  }, [readingDirection, handleNextPage, handlePrevPage, isScrollMode, isSlideMode])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    if (!touch) return
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, pageX: touch.clientX }
    isSwipingRef.current = false
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return
    if (editModeRef.current) return
    const touch = e.touches[0]
    if (!touch) return
    const dx = touch.clientX - touchStartRef.current.x
    const dy = touch.clientY - touchStartRef.current.y
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
      isSwipingRef.current = true
    }
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return
    if (editModeRef.current) return
    if (isScrollMode) return

    const changedTouch = e.changedTouches[0]
    if (!changedTouch) return

    const dx = changedTouch.clientX - touchStartRef.current.x
    touchStartRef.current = null

    if (isSlideMode) {
      if (Math.abs(dx) > 40) {
        if (dx > 0) {
          readingDirection === 'rtl' ? handleNextPage() : handlePrevPage()
        } else {
          readingDirection === 'rtl' ? handlePrevPage() : handleNextPage()
        }
      }
    } else {
      if (Math.abs(dx) > 40) {
        if (dx > 0) {
          readingDirection === 'rtl' ? handleNextPage() : handlePrevPage()
        } else {
          readingDirection === 'rtl' ? handlePrevPage() : handleNextPage()
        }
      }
    }
    setTimeout(() => { isSwipingRef.current = false }, 100)
  }, [readingDirection, handleNextPage, handlePrevPage, isScrollMode, isSlideMode])

  const handleScroll = useCallback(() => {
    const now = Date.now()
    if (now - lastScrollTimeRef.current < 300) return
    lastScrollTimeRef.current = now

    if (!scrollContainerRef.current) return
    const container = scrollContainerRef.current
    const imgs = container.querySelectorAll('[data-page-idx]')
    const containerRect = container.getBoundingClientRect()
    const centerY = containerRect.top + containerRect.height / 2

    let closestPage = 1
    let closestDist = Infinity
    imgs.forEach((img) => {
      const idx = parseInt((img as HTMLElement).dataset.pageIdx || '1', 10)
      const rect = img.getBoundingClientRect()
      const imgCenter = rect.top + rect.height / 2
      const dist = Math.abs(imgCenter - centerY)
      if (dist < closestDist) {
        closestDist = dist
        closestPage = idx
      }
    })

    if (closestPage !== currentPage) {
      useReaderStore.setState({ currentPage: closestPage })
    }
  }, [currentPage])

  const handleWheel = useCallback((e: WheelEvent) => {
    if (!isScrollMode) return
    if (editModeRef.current) return

    const container = scrollContainerRef.current
    if (!container) return

    if (container.scrollTop <= 0 && e.deltaY < 0) {
      e.preventDefault()
      if (boundaryTriggeredRef.current === 'prev') {
        handlePrevChapter()
        boundaryTriggeredRef.current = null
      } else {
        setBoundaryMsg('已到本章开头，再次上滑进入上一章')
        boundaryTriggeredRef.current = 'prev'
        if (boundaryTimerRef.current) clearTimeout(boundaryTimerRef.current)
        boundaryTimerRef.current = setTimeout(() => {
          boundaryTriggeredRef.current = null
          setBoundaryMsg(null)
        }, 5000)
      }
    }

    if (container.scrollTop + container.clientHeight >= container.scrollHeight - 5 && e.deltaY > 0) {
      e.preventDefault()
      if (boundaryTriggeredRef.current === 'next') {
        handleNextChapter()
        boundaryTriggeredRef.current = null
      } else {
        setBoundaryMsg('已到本章末尾，再次下滑进入下一章')
        boundaryTriggeredRef.current = 'next'
        if (boundaryTimerRef.current) clearTimeout(boundaryTimerRef.current)
        boundaryTimerRef.current = setTimeout(() => {
          boundaryTriggeredRef.current = null
          setBoundaryMsg(null)
        }, 5000)
      }
    }
  }, [isScrollMode, handlePrevChapter, handleNextChapter])

  useEffect(() => {
    if (!isScrollMode) return
    const container = scrollContainerRef.current
    if (!container) return
    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [isScrollMode, handleWheel])

  const handleScrollTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isScrollMode) return
    const touch = e.touches[0]
    if (!touch) return
    scrollTouchStartRef.current = touch.clientY
  }, [isScrollMode])

  const handleScrollTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isScrollMode) return
    if (editModeRef.current) return
    const container = scrollContainerRef.current
    if (!container) return

    const changedTouch = e.changedTouches[0]
    if (!changedTouch) return
    const touchEnd = changedTouch.clientY
    const touchDiff = scrollTouchStartRef.current - touchEnd

    if (touchDiff < -50 && container.scrollTop + container.clientHeight >= container.scrollHeight - 50) {
      if (boundaryTriggeredRef.current === 'next') {
        handleNextChapter()
        boundaryTriggeredRef.current = null
      } else {
        setBoundaryMsg('已到本章末尾，再次下滑进入下一章')
        boundaryTriggeredRef.current = 'next'
        if (boundaryTimerRef.current) clearTimeout(boundaryTimerRef.current)
        boundaryTimerRef.current = setTimeout(() => {
          boundaryTriggeredRef.current = null
          setBoundaryMsg(null)
        }, 5000)
      }
    }

    if (touchDiff > 50 && container.scrollTop <= 0) {
      if (boundaryTriggeredRef.current === 'prev') {
        handlePrevChapter()
        boundaryTriggeredRef.current = null
      } else {
        setBoundaryMsg('已到本章开头，再次上滑进入上一章')
        boundaryTriggeredRef.current = 'prev'
        if (boundaryTimerRef.current) clearTimeout(boundaryTimerRef.current)
        boundaryTimerRef.current = setTimeout(() => {
          boundaryTriggeredRef.current = null
          setBoundaryMsg(null)
        }, 5000)
      }
    }
  }, [isScrollMode, handleNextChapter, handlePrevChapter])

  const scrollToPage = useCallback((pageNum: number) => {
    if (!scrollContainerRef.current) return
    const container = scrollContainerRef.current
    const imgs = container.querySelectorAll('[data-page-idx]')
    for (const img of imgs) {
      const idx = parseInt((img as HTMLElement).dataset.pageIdx || '1', 10)
      if (idx === pageNum) {
        img.scrollIntoView({ behavior: 'smooth', block: 'center' })
        break
      }
    }
  }, [])

  useKeyboard({
    onNextPage: () => { if (!editModeRef.current) handleNextPage() },
    onPrevPage: () => { if (!editModeRef.current) handlePrevPage() },
    onGoToStart: () => { if (!editModeRef.current) goToPage(1) },
    onGoToEnd: () => { if (!editModeRef.current) goToPage(effectiveTotalPages) },
    onToggleFullscreen: toggleFullscreen,
    onToggleControls: () => {},
    onEscape: () => { if (!editModeRef.current) onClose() },
  })

  useEffect(() => {
    if (!editMode) {
      const timer = setInterval(() => saveProgress(), 10000)
      return () => clearInterval(timer)
    }
  }, [saveProgress, editMode])

  const getPageImageUrl = (pageNum: number) => `${chaptersApi.getPageImageUrl(chapterId, pageNum)}?t=${cacheBuster.current}`

  useEffect(() => {
    if (isScrollMode || editMode) return
    const preloadRange = 3
    const start = Math.max(1, currentPage - preloadRange)
    const end = Math.min(effectiveTotalPages, currentPage + preloadRange)
    for (let i = start; i <= end; i++) {
      if (i === currentPage) continue
      const img = new Image()
      img.src = getPageImageUrl(i)
    }
  }, [currentPage, effectiveTotalPages, isScrollMode, editMode])

  useEffect(() => {
    if (!isScrollMode || editMode) return
    const preloadRange = 3
    const start = Math.max(1, currentPage - preloadRange)
    const end = Math.min(effectiveTotalPages, currentPage + preloadRange)
    for (let i = start; i <= end; i++) {
      const img = new Image()
      img.src = getPageImageUrl(i)
    }
  }, [currentPage, effectiveTotalPages, isScrollMode, editMode])

  const getPageSource = (page: VirtualPage): string => {
    if (page.type === 'original') return getPageImageUrl(page.pageNum)
    return page.dataUrl
  }

  const handleAddTocEntry = useCallback(() => {
    const title = window.prompt('目录名称', `第${currentPage}页`)
    if (!title?.trim()) return
    setCustomToc(prev => [...prev, { title: title.trim(), page: currentPage, isCustom: true }])
  }, [currentPage])

  const handleRenameTocEntry = useCallback((index: number, oldTitle: string) => {
    const newTitle = window.prompt('重命名目录', oldTitle)
    if (!newTitle?.trim() || newTitle.trim() === oldTitle) return
    setCustomToc(prev => {
      const next = [...prev]
      next[index] = { ...next[index]!, title: newTitle.trim() }
      return next
    })
  }, [])

  const handleDeleteTocEntry = useCallback((index: number) => {
    setCustomToc(prev => prev.filter((_, i) => i !== index))
  }, [])

  const enterEditMode = useCallback(() => {
    const initialList: VirtualPage[] = Array.from({ length: totalPages }, (_, i) => ({
      type: 'original' as const,
      pageNum: i + 1,
    }))
    setPageList(initialList)
    setHasChanges(false)
    setSelectedPageIdx(Math.max(0, Math.min(currentPage - 1, totalPages - 1)))
    setEditMode(true)
    setShowToc(false)
    setShowSettings(false)
  }, [totalPages, currentPage])

  const exitEditMode = useCallback(() => {
    setEditMode(false)
    setPageList([])
    setHasChanges(false)
  }, [])

  const handleDeletePage = useCallback(() => {
    if (pageList.length <= 1) return
    const newList = [...pageList]
    newList.splice(selectedPageIdx, 1)
    setPageList(newList)
    setHasChanges(true)
    const newIdx = Math.max(0, Math.min(selectedPageIdx, newList.length - 1))
    setSelectedPageIdx(newIdx)
    const newPage = newIdx + 1
    goToPage(newPage)
    useReaderStore.getState().openChapter(comicId, chapterId, newList.length, newPage)
  }, [selectedPageIdx, pageList, comicId, chapterId, goToPage])

  const handleInsertPage = useCallback(async (before: boolean = false) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const dataUrl = await readFileAsDataUrl(file)
      const newPage: VirtualPage = { type: 'inserted', tempId: `temp_${Date.now()}`, dataUrl, file }
      const newList = [...pageList]
      const insertIdx = before ? selectedPageIdx : selectedPageIdx + 1
      newList.splice(insertIdx, 0, newPage)
      setPageList(newList)
      setHasChanges(true)
      setSelectedPageIdx(insertIdx)
      useReaderStore.getState().openChapter(comicId, chapterId, newList.length, insertIdx + 1)
    }
    input.click()
  }, [selectedPageIdx, pageList, comicId, chapterId])

  const handleSave = useCallback(async () => {
    if (!hasChanges) { exitEditMode(); return }
    setIsSaving(true)
    try {
      await chaptersApi.backup(chapterId)
      const operations: { type: 'original' | 'new'; index?: number; fileKey?: string }[] = []
      const newFiles = new Map<string, File>()
      let newFileIdx = 0
      for (const page of pageList) {
        if (page.type === 'original') {
          operations.push({ type: 'original', index: page.pageNum - 1 })
        } else {
          const fileKey = `file_${newFileIdx}`
          operations.push({ type: 'new', fileKey })
          newFiles.set(fileKey, page.file)
          newFileIdx++
        }
      }
      await chaptersApi.reorderPages(chapterId, operations, newFiles)
      await chaptersApi.commit(chapterId)
      setEditMode(false)
      setPageList([])
      setHasChanges(false)
      onClose()
    } catch (e) {
      alert('保存失败: ' + (e as Error).message)
    } finally {
      setIsSaving(false)
    }
  }, [hasChanges, pageList, chapterId, exitEditMode, onClose])

  const handleDiscard = useCallback(async () => {
    if (hasChanges) { try { await chaptersApi.revert(chapterId) } catch {} }
    exitEditMode()
  }, [hasChanges, chapterId, editMode])

  const handleExitWithCheck = useCallback(() => {
    if (editMode && hasChanges) {
      const result = confirm('有未保存的修改，是否保存？\n\n点击"确定"保存修改，点击"取消"放弃修改。')
      if (result) { handleSave() } else { handleDiscard() }
    } else if (editMode) {
      exitEditMode()
    } else {
      onClose()
    }
  }, [editMode, hasChanges, handleSave, handleDiscard, exitEditMode, onClose])

  const renderContent = () => {
    const contentClass = "w-full h-full"
    const isScroll = isScrollMode || editMode
    const tp = editMode ? pageList.length : totalPages

    if (isScroll) {
      return (
        <div ref={scrollContainerRef} className={contentClass + " overflow-y-auto"} onScroll={handleScroll} onTouchStart={handleScrollTouchStart} onTouchEnd={handleScrollTouchEnd}>
          <div className="mx-auto max-w-3xl">
            {Array.from({ length: tp }, (_, i) => i + 1).map((pageIdx) => {
              if (editMode) {
                const page = pageList[pageIdx - 1]
                if (!page) return null
                const pageKey = page.type === 'original' ? `orig-${page.pageNum}` : `new-${page.tempId}`
                const isSelected = pageIdx - 1 === selectedPageIdx
                return (
                  <div
                    key={pageKey}
                    data-page-idx={pageIdx}
                    className="w-full flex items-center justify-center relative cursor-pointer"
                    style={{ minHeight: '50vh' }}
                    onClick={() => setSelectedPageIdx(pageIdx - 1)}
                  >
                    <div className="w-full relative" style={{ border: isSelected ? '3px solid var(--primary)' : '3px solid transparent', borderRadius: '4px', transition: 'border-color 0.15s' }}>
                      <img src={getPageSource(page)} alt="" className="w-full object-contain" draggable={false} />
                      <div
                        className="absolute top-2 left-2 rounded px-1.5 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: isSelected ? 'var(--primary)' : 'rgba(0,0,0,0.6)',
                          color: '#fff',
                          transition: 'background-color 0.15s',
                        }}
                      >
                        {pageIdx}
                      </div>
                      {isSelected && (
                        <div
                          className="absolute top-2 right-2 rounded px-1.5 py-0.5 text-xs font-medium"
                          style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
                        >
                          已选中
                        </div>
                      )}
                    </div>
                  </div>
                )
              }
              return (
                <div key={pageIdx} data-page-idx={pageIdx} className="w-full flex items-center justify-center" style={{ minHeight: '50vh' }}>
                  {!imageErrors.has(pageIdx) ? (
                    <img src={getPageImageUrl(pageIdx)} alt="" className="w-full object-contain" onError={() => setImageErrors((prev) => new Set(prev).add(pageIdx))} draggable={false} />
                  ) : (
                    <div className="flex h-64 w-full items-center justify-center text-sm" style={{ backgroundColor: '#1f2937', color: '#9ca3af' }}>第 {pageIdx} 页加载失败</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    let displayPages: number[] = [currentPage]
    if (readerMode === 'double') {
      if (currentPage % 2 === 1) {
        displayPages = [currentPage]
        if (currentPage + 1 <= totalPages) displayPages.push(currentPage + 1)
      } else {
        displayPages = [currentPage - 1, currentPage]
      }
    }

    return (
      <div
        className={contentClass + " flex items-center justify-center gap-1"}
        onClick={handleContentClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {displayPages.map((pageNum) => (
          <div key={pageNum} className="h-full flex items-center justify-center" style={{ maxWidth: readerMode === 'double' ? '50%' : '100%' }}>
            {!imageErrors.has(pageNum) ? (
              <img src={getPageImageUrl(pageNum)} alt="" className="max-h-full max-w-full object-contain" style={{ transform: zoom !== 100 ? `scale(${zoom / 100})` : undefined }} onError={() => setImageErrors((prev) => new Set(prev).add(pageNum))} draggable={false} />
            ) : (
              <div className="flex h-64 w-48 items-center justify-center rounded text-sm" style={{ backgroundColor: '#1f2937', color: '#9ca3af' }}>加载失败</div>
            )}
          </div>
        ))}
      </div>
    )
  }

  const modeOptions: { value: ReaderMode; label: string }[] = [
    { value: 'single', label: '单页' },
    { value: 'double', label: '双页' },
    { value: 'slide', label: '滑动翻页' },
    { value: 'scroll', label: '上下滚动' },
  ]

  const directionOptions: { value: ReadingDirection; label: string }[] = [
    { value: 'ltr', label: '从左到右 →' },
    { value: 'rtl', label: '← 从右到左' },
  ]

  return (
    <div className="fixed inset-0 z-50 bg-black select-none">
      <div className="absolute top-0 left-0 right-0 h-10 flex items-center justify-between border-b px-4 z-10" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-surface)' }}>
        <button onClick={handleExitWithCheck} className="rounded p-1 transition-colors hover:text-white" style={{ color: 'var(--text-secondary)' }}>
          <X className="h-5 w-5" />
        </button>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {readerMode === 'double' && currentPage % 2 === 1 && currentPage + 1 <= effectiveTotalPages
            ? `${currentPage}-${currentPage + 1} / ${effectiveTotalPages}`
            : `${currentPage} / ${effectiveTotalPages}`}
        </span>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowToc(!showToc)} className={`rounded p-1 transition-colors hover:text-white ${showToc ? 'text-primary' : ''}`} style={{ color: showToc ? undefined : 'var(--text-secondary)' }} title="目录">
            <List className="h-4 w-4" />
          </button>
          <button onClick={enterEditMode} className="rounded p-1 transition-colors hover:text-white" style={{ color: 'var(--text-secondary)' }} title="编辑模式">
            <Edit3 className="h-4 w-4" />
          </button>
          <button onClick={() => setShowSettings(!showSettings)} className="rounded p-1 transition-colors hover:text-white" style={{ color: 'var(--text-secondary)' }} title="设置">
            <Settings className="h-4 w-4" />
          </button>
          <button onClick={toggleFullscreen} className="rounded p-1 transition-colors hover:text-white" style={{ color: 'var(--text-secondary)' }} title="全屏">
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {showToc && !editMode && (
        <div className="absolute top-10 left-0 bottom-10 w-56 overflow-y-auto border-r p-3 z-10" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-surface)' }}>
          <h3 className="mb-2 text-sm font-medium flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
            <List className="h-3.5 w-3.5" />目录
          </h3>

          {allChapters.length > 0 && (
            <div className="mb-3">
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>章节</p>
              {allChapters.map((ch) => {
                const isCurrent = ch.id === chapterId
                return (
                  <button
                    key={ch.id}
                    onClick={() => { if (!isCurrent) navigate(`/reader/${comicId}/${ch.id}`) }}
                    className="w-full text-left rounded px-2 py-1.5 text-xs mb-0.5 transition-colors truncate"
                    style={{
                      backgroundColor: isCurrent ? 'rgba(var(--primary-rgb), 0.2)' : 'transparent',
                      color: isCurrent ? 'var(--primary)' : 'var(--text-secondary)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isCurrent) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'
                        e.currentTarget.style.color = 'var(--text-primary)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isCurrent) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.color = 'var(--text-secondary)'
                      }
                    }}
                  >
                    {ch.title || `第 ${ch.chapterNumber} 话`}
                    <span className="ml-1" style={{ color: 'var(--text-muted)' }}>{ch.pageCount}p</span>
                  </button>
                )
              })}
            </div>
          )}

          <div className="border-t pt-2" style={{ borderColor: 'var(--border-default)' }}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>页面书签</p>
              <button onClick={handleAddTocEntry} className="text-primary hover:text-primary-hover">
                <BookmarkPlus className="h-3.5 w-3.5" />
              </button>
            </div>
            {customToc.map((entry, i) => (
              <div key={i} className="flex items-center gap-1 group mb-0.5">
                <button
                  onClick={() => { goToPage(entry.page); setShowToc(false) }}
                  className="flex-1 text-left rounded px-2 py-1.5 text-xs truncate transition-colors"
                  style={{
                    backgroundColor: entry.page === currentPage ? 'rgba(var(--primary-rgb), 0.2)' : 'transparent',
                    color: entry.page === currentPage ? 'var(--primary)' : 'var(--text-secondary)'
                  }}
                  onMouseEnter={(e) => {
                    if (entry.page !== currentPage) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'
                      e.currentTarget.style.color = 'var(--text-primary)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (entry.page !== currentPage) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = 'var(--text-secondary)'
                    }
                  }}
                >
                  {entry.title}<span className="ml-1" style={{ color: 'var(--text-muted)' }}>P{entry.page}</span>
                </button>
                <button onClick={() => handleRenameTocEntry(i, entry.title)} className="opacity-0 group-hover:opacity-100 rounded p-0.5 transition-colors hover:text-white" style={{ color: 'var(--text-muted)' }}>
                  <Pencil className="h-3 w-3" />
                </button>
                <button onClick={() => handleDeleteTocEntry(i)} className="opacity-0 group-hover:opacity-100 rounded p-0.5 transition-colors hover:text-red-400" style={{ color: 'var(--text-muted)' }}>
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {editMode && (
        <div className="absolute top-10 left-0 bottom-10 w-56 overflow-y-auto border-r p-3 z-10" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-surface)' }}>
          <h3 className="mb-2 text-sm font-medium text-primary flex items-center gap-1">
            <Edit3 className="h-3.5 w-3.5" />编辑模式
          </h3>
          <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
            选中第 {selectedPageIdx + 1} 页（共 {pageList.length} 页）
          </p>
          {hasChanges && <p className="text-xs text-yellow-500 mb-2">有未保存的修改</p>}
          <div className="space-y-2">
            <button onClick={() => handleInsertPage(true)} disabled={isSaving} className="w-full flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs text-primary disabled:opacity-50" style={{ borderColor: 'rgba(var(--primary-rgb), 0.3)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(var(--primary-rgb), 0.1)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
              <ImagePlus className="h-3.5 w-3.5" />前方插入一页
            </button>
            <button onClick={() => handleInsertPage(false)} disabled={isSaving} className="w-full flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs text-primary disabled:opacity-50" style={{ borderColor: 'rgba(var(--primary-rgb), 0.3)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(var(--primary-rgb), 0.1)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
              <ImagePlus className="h-3.5 w-3.5" />后方插入一页
            </button>
            <button onClick={handleDeletePage} disabled={pageList.length <= 1 || isSaving} className="w-full flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs disabled:opacity-50" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', color: '#f87171' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
              <Trash2 className="h-3.5 w-3.5" />删除选中页
            </button>
            <div className="border-t pt-2 space-y-2" style={{ borderColor: 'var(--border-default)' }}>
              <button onClick={handleSave} disabled={isSaving} className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs hover:bg-primary-hover disabled:opacity-50" style={{ color: 'var(--text-primary)' }}>
                <Save className="h-3.5 w-3.5" />{isSaving ? '保存中...' : '保存修改'}
              </button>
              <button onClick={handleExitWithCheck} disabled={isSaving} className="w-full flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs disabled:opacity-50" style={{ borderColor: 'var(--border-light)', color: 'var(--text-secondary)' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}>
                <RotateCcw className="h-3.5 w-3.5" />退出编辑
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="absolute top-10 left-0 right-0 bottom-10 overflow-hidden bg-black" style={{ left: (showToc && !editMode) || editMode ? '14rem' : '0' }}>
        {renderContent()}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-10 flex items-center justify-between border-t px-4 z-10" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-surface)' }}>
        <button onClick={handlePrevPage} disabled={currentPage <= 1} className="rounded p-1 transition-colors hover:text-white disabled:opacity-30" style={{ color: 'var(--text-secondary)' }}>
          {readingDirection === 'rtl' ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
        <input
          type="range"
          min={1}
          max={effectiveTotalPages}
          value={currentPage}
          onChange={(e) => {
            const p = parseInt(e.target.value, 10)
            goToPage(p)
            if (isScrollMode) scrollToPage(p)
          }}
          className="w-48 accent-primary"
        />
        <button onClick={handleNextPage} disabled={currentPage >= effectiveTotalPages} className="rounded p-1 transition-colors hover:text-white disabled:opacity-30" style={{ color: 'var(--text-secondary)' }}>
          {readingDirection === 'rtl' ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>
      </div>

      {showSettings && (
        <div className="fixed top-10 right-4 z-[70] w-64 rounded-lg border p-4 shadow-xl" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-surface)' }} onClick={(e) => e.stopPropagation()}>
          <h3 className="mb-3 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>阅读设置</h3>
          <div className="mb-3">
            <label className="mb-1.5 block text-xs" style={{ color: 'var(--text-secondary)' }}>阅读模式</label>
            <div className="grid grid-cols-2 gap-1.5">
              {modeOptions.map((opt) => (
                <button key={opt.value} onClick={() => setReaderMode(opt.value)} className="rounded px-2 py-1.5 text-xs transition-colors" style={{
                  backgroundColor: readerMode === opt.value ? 'var(--primary)' : 'var(--bg-surface-hover)',
                  color: readerMode === opt.value ? 'var(--text-primary)' : 'var(--text-secondary)'
                }} onMouseEnter={(e) => {
                  if (readerMode !== opt.value) {
                    e.currentTarget.style.color = 'var(--text-primary)'
                  }
                }} onMouseLeave={(e) => {
                  if (readerMode !== opt.value) {
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }
                }}>{opt.label}</button>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <label className="mb-1.5 block text-xs" style={{ color: 'var(--text-secondary)' }}>翻页方向</label>
            <div className="grid grid-cols-2 gap-1.5">
              {directionOptions.map((opt) => (
                <button key={opt.value} onClick={() => setReadingDirection(opt.value)} className="rounded px-2 py-1.5 text-xs transition-colors" style={{
                  backgroundColor: readingDirection === opt.value ? 'var(--primary)' : 'var(--bg-surface-hover)',
                  color: readingDirection === opt.value ? 'var(--text-primary)' : 'var(--text-secondary)'
                }} onMouseEnter={(e) => {
                  if (readingDirection !== opt.value) {
                    e.currentTarget.style.color = 'var(--text-primary)'
                  }
                }} onMouseLeave={(e) => {
                  if (readingDirection !== opt.value) {
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }
                }}>{opt.label}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs" style={{ color: 'var(--text-secondary)' }}>缩放 {zoom}%</label>
            <input type="range" min={50} max={300} value={zoom} onChange={(e) => setZoom(parseInt(e.target.value))} className="w-full accent-primary" />
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
