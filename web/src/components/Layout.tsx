import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router'
import {
  Home,
  Library,
  FolderTree,
  Bookmark,
  Dice5,
  Filter,
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
import clsx from 'clsx'
import ScanDialog from '@/components/ScanDialog'
import { SearchBar } from '@/components/SearchBar'

const navItems = [
  { path: '/', label: '首页', icon: Home },
  { path: '/library', label: '漫画库', icon: Library },
  { path: '/categories', label: '分类与标签', icon: FolderTree },
  { path: '/bookmarks', label: '收藏', icon: Bookmark },
  { path: '/random', label: '随机发现', icon: Dice5 },
]

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { sidebarOpen, sidebarCollapsed, toggleSidebar, toggleSidebarCollapsed, settingsOpen, setSettingsOpen, theme, setTheme } = useAppStore()
  const { filters, setFilters } = useComicStore()
  const [isMobile, setIsMobile] = useState(false)
  const [namingMode, setNamingMode] = useState(() => localStorage.getItem('namingMode') || 'folder')
  const [scanOpen, setScanOpen] = useState(false)

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

  const handleGlobalSearch = (query: string) => {
    setFilters({ query, page: 1 })
    navigate('/library')
  }

  const hasActiveFilters = !!(filters.categoryId || filters.tagId || filters.status || filters.author || filters.query)
  const activeFilterCount = (filters.categoryId ? 1 : 0) + (filters.tagId ? 1 : 0) + (filters.status ? 1 : 0) + (filters.author ? 1 : 0) + (filters.query ? 1 : 0)

  const isReaderPage = location.pathname.startsWith('/reader')

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
            <button
              onClick={() => setScanOpen(true)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium"
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

          <div className="flex flex-1 items-center gap-2">
            <SearchBar
              onSearch={handleGlobalSearch}
              initialQuery={new URLSearchParams(location.search).get('query') || ''}
              className="flex-1 max-w-md"
            />
            <button
              onClick={() => {
                if (location.pathname === '/library') {
                  navigate(new URLSearchParams(location.search).get('showFilters') === '1' ? '/library?showFilters=0' : '/library?showFilters=1')
                } else {
                  navigate('/library?showFilters=1')
                }
              }}
              className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors"
              style={{
                borderColor: hasActiveFilters ? 'var(--primary)' : 'var(--border-light)',
                backgroundColor: hasActiveFilters ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent',
                color: hasActiveFilters ? 'var(--primary)' : 'var(--text-secondary)',
              }}
              title="筛选漫画"
            >
              <Filter className="h-4 w-4" />
              筛选
              {hasActiveFilters && (
                <span className="rounded-full bg-primary px-1.5 py-0.5 text-xs" style={{ color: 'var(--text-primary)' }}>
                  {activeFilterCount}
                </span>
              )}
            </button>
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
              onClick={() => setScanOpen(true)}
              className="rounded-lg p-2"
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
                <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '0.75rem' }}>
                  <h3 className="mb-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>命名方式</h3>
                  <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>扫描时如何命名漫画</p>
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
                      <p className="mt-0.5 text-[10px] opacity-60">使用ComicInfo标题</p>
                    </button>
                  </div>
                </div>
                <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '0.75rem' }}>
                  <button
                    onClick={() => { setScanOpen(true); setSettingsOpen(false) }}
                    className="w-full rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-hover"
                  >
                    扫描漫画库
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 pb-20 md:p-6 md:pb-6" style={{ backgroundColor: 'var(--bg-base)', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.5rem)' }}>
          <Outlet />
        </main>
      </div>

      <ScanDialog open={scanOpen} onClose={() => setScanOpen(false)} />
    </div>
  )
}
