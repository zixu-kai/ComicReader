import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useLocation, Outlet } from 'react-router'
import {
  Home,
  Library,
  BookOpen,
  FolderTree,
  Bookmark,
  Dice5,
  Search,
  ScanLine,
  Settings,
  Menu,
  X,
  ChevronLeft,
  Sun,
  Moon,
} from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { useComicStore } from '@/stores/comicStore'
import { useBookStore } from '@/stores/bookStore'
import { comicsApi, booksApi } from '@/services/api'
import type { Comic, Book } from '@/types'
import clsx from 'clsx'
import DonateButton from '@/components/DonateButton'

const navItems = [
  { path: '/', label: '首页', icon: Home },
  { path: '/library', label: '漫画库', icon: Library },
  { path: '/books', label: '图书库', icon: BookOpen },
  { path: '/categories', label: '分类与标签', icon: FolderTree },
  { path: '/bookmarks', label: '收藏', icon: Bookmark },
  { path: '/random', label: '随机发现', icon: Dice5 },
]

export default function Layout() {
  const location = useLocation()
  const { sidebarOpen, sidebarCollapsed, toggleSidebar, toggleSidebarCollapsed, settingsOpen, setSettingsOpen, theme, setTheme } = useAppStore()
  const { scanLibrary, loading } = useComicStore()
  const { scanBooks } = useBookStore()
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchComics, setSearchComics] = useState<Comic[]>([])
  const [searchBooks, setSearchBooks] = useState<Book[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [namingMode, setNamingMode] = useState(() => localStorage.getItem('namingMode') || 'folder')
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (isMobile && sidebarOpen) {
      toggleSidebar()
    }
  }, [isMobile])

  const handleScan = useCallback(async () => {
    try {
      const [comicRes, bookRes] = await Promise.all([
        comicsApi.scan(namingMode),
        booksApi.scan(namingMode),
      ])
      const parts: string[] = []
      if (comicRes.added > 0 || comicRes.updated > 0 || comicRes.removed > 0) {
        parts.push(`漫画: +${comicRes.added} 更新${comicRes.updated} 删除${comicRes.removed}`)
      }
      if (bookRes.added > 0 || bookRes.updated > 0 || bookRes.removed > 0) {
        parts.push(`图书: +${bookRes.added} 更新${bookRes.updated} 删除${bookRes.removed}`)
      }
      setScanResult(parts.length > 0 ? parts.join(' | ') : '没有新增内容')
      scanLibrary()
      scanBooks()
      setTimeout(() => setScanResult(null), 5000)
    } catch {
      setScanResult('扫描失败')
      setTimeout(() => setScanResult(null), 3000)
    }
  }, [scanLibrary, scanBooks, namingMode])

  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchComics([])
      setSearchBooks([])
      setShowDropdown(false)
      return
    }
    setSearchLoading(true)
    Promise.all([
      comicsApi.search(query, { pageSize: 5 }).catch(() => ({ data: [], total: 0, page: 1, pageSize: 5, totalPages: 0 })),
      booksApi.search(query).catch(() => []),
    ]).then(([comicsRes, booksRes]) => {
      setSearchComics(comicsRes.data)
      setSearchBooks(Array.isArray(booksRes) ? booksRes : [])
      setSearchLoading(false)
      setShowDropdown(true)
    })
  }, [])

  const handleSearchInput = useCallback((value: string) => {
    setSearchQuery(value)
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    if (!value.trim()) {
      setSearchComics([])
      setSearchBooks([])
      setShowDropdown(false)
      return
    }
    debounceRef.current = setTimeout(() => {
      handleSearch(value)
    }, 300)
  }, [handleSearch])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setShowDropdown(false)
    setSearchQuery('')
    setSearchComics([])
    setSearchBooks([])
  }, [location.pathname])

  const isReaderPage = location.pathname.startsWith('/reader') || location.pathname.startsWith('/book-reader')

  if (isReaderPage) {
    return <Outlet />
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-base)' }}>
      {sidebarOpen && !isMobile && (
        <div
          className={clsx(
            'flex flex-col transition-all duration-200',
            sidebarCollapsed ? 'w-16' : 'w-56'
          )}
          style={{ borderRight: '1px solid var(--border-default)', backgroundColor: 'var(--bg-surface)' }}
        >
          <div className="flex h-14 items-center justify-between px-4" style={{ borderBottom: '1px solid var(--border-default)' }}>
            {!sidebarCollapsed && (
              <span className="text-lg font-bold text-primary">私阁</span>
            )}
            <button
              onClick={toggleSidebarCollapsed}
              className="rounded p-1 hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}
            >
              <ChevronLeft
                className={clsx('h-4 w-4 transition-transform', sidebarCollapsed && 'rotate-180')}
              />
            </button>
          </div>

          <nav className="flex-1 space-y-1 p-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={clsx(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'hover:opacity-80'
                  )}
                  style={!isActive ? { color: 'var(--text-secondary)' } : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              )
            })}
          </nav>

          <div className="p-2" style={{ borderTop: '1px solid var(--border-default)' }}>
            <DonateButton />
            <button
              onClick={() => handleScan()}
              disabled={loading}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium disabled:opacity-50"
              style={{ color: 'var(--text-secondary)' }}
            >
              <ScanLine className="h-5 w-5 shrink-0" />
              {!sidebarCollapsed && <span>扫描库</span>}
            </button>
          </div>
        </div>
      )}

      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-56 flex flex-col" style={{ borderRight: '1px solid var(--border-default)', backgroundColor: 'var(--bg-surface)' }}>
            <div className="flex h-14 items-center justify-between px-4" style={{ borderBottom: '1px solid var(--border-default)' }}>
              <span className="text-lg font-bold text-primary">私阁</span>
              <button onClick={toggleSidebar} className="rounded p-1" style={{ color: 'var(--text-secondary)' }}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 p-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={toggleSidebar}
                    className={clsx(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'hover:opacity-80'
                    )}
                    style={!isActive ? { color: 'var(--text-secondary)' } : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex-1" style={{ backgroundColor: 'var(--overlay)' }} onClick={toggleSidebar} />
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center gap-4 px-4" style={{ borderBottom: '1px solid var(--border-default)', backgroundColor: 'var(--bg-surface)' }}>
          {(!sidebarOpen || isMobile) && (
            <button onClick={toggleSidebar} className="rounded p-1" style={{ color: 'var(--text-secondary)' }}>
              <Menu className="h-5 w-5" />
            </button>
          )}

          <div className="flex flex-1 items-center gap-2" ref={searchRef}>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                onFocus={() => { if (searchQuery.trim() && (searchComics.length > 0 || searchBooks.length > 0)) setShowDropdown(true) }}
                placeholder="搜索漫画和图书..."
                className="w-full rounded-lg py-2 pl-9 pr-9 text-sm outline-none focus:ring-1 focus:ring-primary"
                style={{ border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-surface-hover)', color: 'var(--text-primary)' }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setSearchComics([]); setSearchBooks([]); setShowDropdown(false) }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-80"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {showDropdown && searchQuery.trim() && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-y-auto rounded-lg shadow-xl" style={{ border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-surface)' }}>
                  {searchLoading && (
                    <div className="px-4 py-3 text-center text-xs" style={{ color: 'var(--text-muted)' }}>搜索中...</div>
                  )}
                  {!searchLoading && searchComics.length === 0 && searchBooks.length === 0 && (
                    <div className="px-4 py-3 text-center text-xs" style={{ color: 'var(--text-muted)' }}>未找到结果</div>
                  )}
                  {searchComics.length > 0 && (
                    <div>
                      <div className="sticky top-0 px-3 py-1.5 text-xs font-medium" style={{ borderBottom: '1px solid var(--border-default)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>漫画</div>
                      {searchComics.map((comic) => (
                        <Link
                          key={`comic-${comic.id}`}
                          to={`/comic/${comic.id}`}
                          className="flex items-center gap-3 px-3 py-2 transition-colors"
                          style={{ color: 'var(--text-primary)' }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
                        >
                          <div className="h-10 w-8 shrink-0 overflow-hidden rounded" style={{ backgroundColor: 'var(--bg-surface-hover)' }}>
                            <img src={`/api/comics/${comic.id}/cover`} alt="" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm">{comic.title}</p>
                            {comic.author && <p className="truncate text-xs" style={{ color: 'var(--text-muted)' }}>{comic.author}</p>}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                  {searchBooks.length > 0 && (
                    <div>
                      <div className="sticky top-0 px-3 py-1.5 text-xs font-medium" style={{ borderBottom: '1px solid var(--border-default)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>图书</div>
                      {searchBooks.map((book) => (
                        <Link
                          key={`book-${book.id}`}
                          to={`/book/${book.id}`}
                          className="flex items-center gap-3 px-3 py-2 transition-colors"
                          style={{ color: 'var(--text-primary)' }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
                        >
                          <div className="h-10 w-8 shrink-0 overflow-hidden rounded" style={{ backgroundColor: 'var(--bg-surface-hover)' }}>
                            <img src={`/api/books/${book.id}/cover`} alt="" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm">{book.title}</p>
                            {book.author && <p className="truncate text-xs" style={{ color: 'var(--text-muted)' }}>{book.author}</p>}
                          </div>
                          <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px]" style={{ backgroundColor: 'var(--bg-surface-hover)', color: 'var(--text-muted)' }}>{book.format.toUpperCase()}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-lg p-2 transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              title={theme === 'dark' ? '切换浅色模式' : '切换深色模式'}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => handleScan()}
              disabled={loading}
              className="rounded-lg p-2 disabled:opacity-50"
              style={{ color: 'var(--text-secondary)' }}
              title="扫描库"
            >
              <ScanLine className="h-5 w-5" />
            </button>
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="rounded-lg p-2"
              style={{ color: 'var(--text-secondary)' }}
              title="设置"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </header>

        {settingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'var(--overlay)' }} onClick={() => setSettingsOpen(false)}>
            <div className="w-full max-w-md rounded-xl p-6 shadow-2xl" style={{ border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-surface)' }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>设置</h2>
                <button onClick={() => setSettingsOpen(false)} className="rounded p-1" style={{ color: 'var(--text-secondary)' }}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>外观</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setTheme('dark')}
                      className={clsx(
                        'rounded-lg border px-3 py-2 text-xs transition-colors flex items-center gap-2',
                        theme === 'dark' ? 'border-primary bg-primary/10 text-primary' : ''
                      )}
                      style={theme !== 'dark' ? { borderColor: 'var(--border-light)', color: 'var(--text-secondary)' } : undefined}
                    >
                      <Moon className="h-4 w-4" />
                      深色模式
                    </button>
                    <button
                      onClick={() => setTheme('light')}
                      className={clsx(
                        'rounded-lg border px-3 py-2 text-xs transition-colors flex items-center gap-2',
                        theme === 'light' ? 'border-primary bg-primary/10 text-primary' : ''
                      )}
                      style={theme !== 'light' ? { borderColor: 'var(--border-light)', color: 'var(--text-secondary)' } : undefined}
                    >
                      <Sun className="h-4 w-4" />
                      浅色模式
                    </button>
                  </div>
                </div>
                <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '0.75rem' }}>
                  <h3 className="mb-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>漫画目录</h3>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>在 .env 文件中修改 COMICS_DIR</p>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>图书目录</h3>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>在 .env 文件中修改 BOOKS_DIR</p>
                </div>
                <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '0.75rem' }}>
                  <h3 className="mb-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>命名方式</h3>
                  <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>扫描时如何命名漫画和小说</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { localStorage.setItem('namingMode', 'folder'); setNamingMode('folder') }}
                      className={clsx(
                        'rounded-lg border px-3 py-2 text-xs transition-colors',
                        namingMode !== 'metadata'
                          ? 'border-primary bg-primary/10 text-primary'
                          : ''
                      )}
                      style={namingMode === 'metadata' ? { borderColor: 'var(--border-light)', color: 'var(--text-secondary)' } : undefined}
                    >
                      文件夹名
                      <p className="mt-0.5 text-[10px] opacity-60">使用文件夹/文件名</p>
                    </button>
                    <button
                      onClick={() => { localStorage.setItem('namingMode', 'metadata'); setNamingMode('metadata') }}
                      className={clsx(
                        'rounded-lg border px-3 py-2 text-xs transition-colors',
                        namingMode === 'metadata'
                          ? 'border-primary bg-primary/10 text-primary'
                          : ''
                      )}
                      style={namingMode !== 'metadata' ? { borderColor: 'var(--border-light)', color: 'var(--text-secondary)' } : undefined}
                    >
                      元数据名
                      <p className="mt-0.5 text-[10px] opacity-60">使用ComicInfo/EPUB标题</p>
                    </button>
                  </div>
                </div>
                <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '0.75rem' }}>
                  <button
                    onClick={() => { handleScan(); setSettingsOpen(false) }}
                    disabled={loading}
                    className="w-full rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-hover disabled:opacity-50"
                  >
                    {loading ? '扫描中...' : '重新扫描库'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-6" style={{ backgroundColor: 'var(--bg-base)' }}>
          <Outlet />
        </main>
      </div>

      {scanResult && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-lg px-4 py-2 text-sm shadow-xl" style={{ border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
          {scanResult}
        </div>
      )}
    </div>
  )
}
