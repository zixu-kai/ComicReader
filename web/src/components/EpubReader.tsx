import { useEffect, useRef, useState, useCallback } from 'react'
import { booksApi } from '@/services/api'
import { ChevronLeft, ChevronRight, Maximize, Minimize, List, Bookmark, X, Settings, Sun, Moon, Type, Loader2 } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'

interface EpubReaderProps {
  bookId: number
  initialCfi?: string
  initialChapter?: number
  onClose: () => void
}

interface ReaderSettings {
  fontSize: number
  lineHeight: number
  theme: 'dark' | 'light' | 'sepia'
  fontFamily: 'serif' | 'sans-serif' | 'system'
}

const THEMES = {
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

const DEFAULT_SETTINGS: ReaderSettings = {
  fontSize: 16,
  lineHeight: 1.8,
  theme: 'dark',
  fontFamily: 'sans-serif',
}

export function EpubReader({ bookId, initialCfi, initialChapter, onClose }: EpubReaderProps) {
  const bookRef = useRef<any>(null)
  const renditionRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [showToc, setShowToc] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [toc, setToc] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [loadingText, setLoadingText] = useState('加载中...')
  const [settings, setSettings] = useState<ReaderSettings>(() => {
    try {
      const saved = localStorage.getItem('epubSettings')
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS
    } catch { return DEFAULT_SETTINGS }
  })
  const settingsRef = useRef<ReaderSettings>(settings)
  const { theme: globalTheme } = useAppStore()

  useEffect(() => {
    if (globalTheme === 'light' && settings.theme === 'dark') {
      updateSettings({ theme: 'light' })
    } else if (globalTheme === 'dark' && settings.theme === 'light') {
      updateSettings({ theme: 'dark' })
    }
  }, [globalTheme])

  const applyThemeAndStyle = useCallback((s: ReaderSettings) => {
    if (!renditionRef.current) return
    const ff = FONT_FAMILIES.find(f => f.value === s.fontFamily)
    const bodyStyles: Record<string, string> = {
      ...THEMES[s.theme].body,
      'font-size': `${s.fontSize}px`,
      'line-height': String(s.lineHeight),
      'padding': '20px 40px !important',
    }
    if (ff) {
      bodyStyles['font-family'] = ff.name
    }
    const themeObj = {
      ...THEMES[s.theme],
      body: bodyStyles,
    }
    renditionRef.current.themes.register('custom', themeObj as any)
    renditionRef.current.themes.select('custom')
  }, [])

  const updateSettings = useCallback((partial: Partial<ReaderSettings>) => {
    const next = { ...settingsRef.current, ...partial }
    settingsRef.current = next
    setSettings(next)
    localStorage.setItem('epubSettings', JSON.stringify(next))
    applyThemeAndStyle(next)
  }, [applyThemeAndStyle])

  useEffect(() => {
    let mounted = true

    const loadEpub = async () => {
      try {
        setLoading(true)
        setLoadingText('下载 EPUB 文件...')

        const ePub = (await import('epubjs')).default
        const fileUrl = booksApi.getFileUrl(bookId)
        const response = await fetch(fileUrl)
        if (!response.ok) throw new Error(`Failed to fetch EPUB: ${response.status}`)
        const arrayBuffer = await response.arrayBuffer()
        const book = ePub(arrayBuffer)
        bookRef.current = book

        setLoadingText('解析 EPUB 结构...')
        await book.ready

        const rendition = book.renderTo(containerRef.current!, {
          width: '100%',
          height: '100%',
          spread: 'none',
          flow: 'scrolled-doc',
        })

        renditionRef.current = rendition

        const s = settingsRef.current
        applyThemeAndStyle(s)

        setLoadingText('渲染页面...')
        if (initialCfi) {
          await rendition.display(initialCfi)
        } else {
          await rendition.display()
        }
        setLoading(false)

        requestIdleCallback(() => {
          if (!mounted) return
          book.locations.generate(4096).then(() => {
            if (mounted) {
              const total = book.locations.length()
              setTotalPages(total)
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
            setTitle(location.start.label || '')

            booksApi.updateProgress(bookId, {
              cfi: location.start.cfi,
              percentage: locLen > 0 ? Math.round(book.locations.percentageFromCfi(location.start.cfi) * 10000) / 100 : 0,
            })
          }
        })

        rendition.on('click', (event: any) => {
          const rect = containerRef.current?.getBoundingClientRect()
          if (!rect) return
          const x = (event.pageX - rect.left) / rect.width
          if (x < 0.3) {
            rendition.prev()
          } else if (x > 0.7) {
            rendition.next()
          }
        })

        book.loaded.navigation.then((nav: any) => {
          if (mounted) {
            setToc(nav.toc)
            if (initialChapter !== undefined && nav.toc.length > 0 && initialChapter < nav.toc.length) {
              const target = nav.toc[initialChapter]
              if (target?.href) {
                rendition.display(target.href)
              }
            }
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
      renditionRef.current?.destroy()
      bookRef.current?.destroy()
    }
  }, [bookId])

  const goPrev = useCallback(() => {
    renditionRef.current?.prev()
  }, [])

  const goNext = useCallback(() => {
    renditionRef.current?.next()
  }, [])

  const goToCfi = useCallback((cfi: string) => {
    renditionRef.current?.display(cfi)
    setShowToc(false)
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

  const addBookmark = useCallback(async () => {
    const location = renditionRef.current?.currentLocation()
    if (location?.start?.cfi) {
      await booksApi.createBookmark(bookId, {
        cfi: location.start.cfi,
        title: title || undefined,
      })
    }
  }, [bookId, title])

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === 'ArrowRight') goNext()
      else if (e.key === 'Escape') onClose()
      else if (e.key === 'f' || e.key === 'F') toggleFullscreen()
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [goPrev, goNext, onClose, toggleFullscreen])

  const bgColor = THEMES[settings.theme].body['background-color']

  return (
    <div className="flex h-screen flex-col" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="flex h-10 items-center justify-between px-4" style={{ borderBottom: '1px solid var(--border-default)', backgroundColor: 'var(--bg-surface)' }}>
        <span className="text-sm truncate max-w-[40%]" style={{ color: 'var(--text-secondary)' }}>{loading ? 'EPUB 阅读器' : title}</span>
        <div className="flex items-center gap-1">
          {!loading && (
            <>
              <button onClick={addBookmark} className="rounded p-1.5" style={{ color: 'var(--text-secondary)' }} title="添加书签">
                <Bookmark className="h-4 w-4" />
              </button>
              <button onClick={() => { setShowSettings(!showSettings); setShowToc(false) }} className="rounded p-1.5" style={{ color: 'var(--text-secondary)' }} title="设置">
                <Settings className="h-4 w-4" />
              </button>
              <button onClick={() => { setShowToc(!showToc); setShowSettings(false) }} className="rounded p-1.5" style={{ color: 'var(--text-secondary)' }} title="目录">
                <List className="h-4 w-4" />
              </button>
              <button onClick={toggleFullscreen} className="rounded p-1.5" style={{ color: 'var(--text-secondary)' }} title="全屏">
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </button>
            </>
          )}
          <button onClick={onClose} className="rounded p-1.5" style={{ color: 'var(--text-secondary)' }} title="关闭">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ backgroundColor: 'var(--bg-base)' }}>
            {loadError ? (
              <div className="text-center space-y-4">
                <p style={{ color: 'var(--color-accent-red)' }} className="text-sm">加载失败，EPUB 文件可能损坏或格式不支持</p>
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

        {!loading && showToc && (
          <div className="w-64 shrink-0 overflow-y-auto p-3" style={{ borderRight: '1px solid var(--border-default)', backgroundColor: 'var(--bg-surface)' }}>
            <h3 className="mb-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>目录</h3>
            {toc.map((item, i) => (
              <button
                key={i}
                onClick={() => goToCfi(item.href)}
                className="block w-full text-left rounded px-2 py-1.5 text-xs truncate"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--text-secondary)' }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {!loading && showSettings && (
          <div className="w-72 shrink-0 overflow-y-auto p-4 space-y-5" style={{ borderRight: '1px solid var(--border-default)', backgroundColor: 'var(--bg-surface)' }}>
            <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>阅读设置</h3>

            <div>
              <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>字体大小</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateSettings({ fontSize: Math.max(12, settings.fontSize - 2) })}
                  className="rounded px-2 py-1 text-xs disabled:opacity-30"
                  style={{ backgroundColor: 'var(--bg-surface-hover)', color: 'var(--text-primary)' }}
                  disabled={settings.fontSize <= 12}
                >
                  A-
                </button>
                <span className="text-sm min-w-[3rem] text-center" style={{ color: 'var(--text-primary)' }}>{settings.fontSize}px</span>
                <button
                  onClick={() => updateSettings({ fontSize: Math.min(32, settings.fontSize + 2) })}
                  className="rounded px-2 py-1 text-xs disabled:opacity-30"
                  style={{ backgroundColor: 'var(--bg-surface-hover)', color: 'var(--text-primary)' }}
                  disabled={settings.fontSize >= 32}
                >
                  A+
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>主题</label>
              <div className="flex gap-2">
                {(Object.entries(THEMES) as [ReaderSettings['theme'], typeof THEMES.dark][]).map(([key, t]) => {
                  const Icon = t.icon
                  return (
                    <button
                      key={key}
                      onClick={() => updateSettings({ theme: key })}
                      className={`flex-1 rounded px-3 py-1.5 text-xs flex items-center justify-center gap-1.5 ${settings.theme === key ? 'bg-blue-600 text-white' : ''}`}
                      style={settings.theme !== key ? { backgroundColor: 'var(--bg-surface-hover)', color: 'var(--text-secondary)' } : undefined}
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
                行间距 <span style={{ color: 'var(--text-muted)' }}>{settings.lineHeight}</span>
              </label>
              <input
                type="range"
                min="1.2"
                max="3"
                step="0.2"
                value={settings.lineHeight}
                onChange={(e) => updateSettings({ lineHeight: parseFloat(e.target.value) })}
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
                    onClick={() => updateSettings({ fontFamily: ff.value })}
                    className={`rounded px-3 py-1.5 text-xs text-left ${settings.fontFamily === ff.value ? 'bg-blue-600 text-white' : ''}`}
                    style={settings.fontFamily !== ff.value ? { backgroundColor: 'var(--bg-surface-hover)', color: 'var(--text-secondary)' } : undefined}
                  >
                    {ff.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 relative" style={{ backgroundColor: bgColor }}>
          <div
            ref={containerRef}
            className="h-full w-full"
            style={{
              fontFamily: FONT_FAMILIES.find(f => f.value === settings.fontFamily)?.name,
            }}
          />
          {!loading && (
            <>
              <div className="pointer-events-none absolute inset-y-0 left-0 w-[30%]" onClick={() => goPrev()} />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-[30%]" onClick={() => goNext()} />
            </>
          )}
        </div>
      </div>

      <div className="flex h-10 items-center justify-between px-4" style={{ borderTop: '1px solid var(--border-default)', backgroundColor: 'var(--bg-surface)' }}>
        <button onClick={goPrev} className="rounded p-1" style={{ color: 'var(--text-secondary)' }}>
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {totalPages > 0 ? `${currentPage} / ${totalPages}` : '加载中...'}
        </span>
        <button onClick={goNext} className="rounded p-1" style={{ color: 'var(--text-secondary)' }}>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
