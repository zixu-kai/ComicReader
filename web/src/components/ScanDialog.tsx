import { useEffect, useState } from 'react'
import { comicsApi } from '@/services/api'
import { useComicStore } from '@/stores/comicStore'
import { ScanLine, X, Check } from 'lucide-react'
import clsx from 'clsx'

interface ScanDialogProps {
  open: boolean
  onClose: () => void
}

export default function ScanDialog({ open, onClose }: ScanDialogProps) {
  const { scanLibrary } = useComicStore()
  const [folders, setFolders] = useState<string[]>([])
  const [scope, setScope] = useState<string>('all')
  const [scanning, setScanning] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [progress, setProgress] = useState<{ phase: string; total: number; processed: number; current: string } | null>(null)

  useEffect(() => {
    if (!open) return
    setMessage(null)
    setScanning(false)
    try {
      setScope(localStorage.getItem('ownShelfScanScope') || 'all')
    } catch {}
    comicsApi.scanOptions().then((res) => {
      setFolders(Array.isArray(res.folders) ? res.folders : [])
    }).catch(() => setFolders([]))
  }, [open])

  const pickScope = (s: string) => {
    setScope(s)
    try { localStorage.setItem('ownShelfScanScope', s) } catch {}
  }

  const handleScan = async () => {
    if (scanning) return
    setScanning(true)
    setProgress(null)
    setMessage('扫描中...')
    try {
      const namingMode = (() => {
        try { return localStorage.getItem('namingMode') || 'folder' } catch { return 'folder' }
      })()
      await comicsApi.scan(namingMode, scope)
      const pollStatus = async () => {
        try {
          const status = await comicsApi.scanStatus()
          if (status.progress) setProgress(status.progress)
          if (status.status === 'done') {
            const r = status.result
            if (r) {
              setMessage(`新增 ${r.added} · 更新 ${r.updated} · 删除 ${r.removed}`)
            } else {
              setMessage('扫描完成')
            }
            setProgress(null)
            scanLibrary()
            setScanning(false)
          } else {
            setTimeout(pollStatus, 600)
          }
        } catch {
          setTimeout(pollStatus, 2000)
        }
      }
      setTimeout(pollStatus, 600)
    } catch {
      setMessage('扫描失败，请重试')
      setScanning(false)
    }
  }

  if (!open) return null

  const hasSubFolders = folders.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'var(--overlay)' }} onClick={() => !scanning && onClose()}>
      <div className="w-full max-w-md rounded-xl border p-6 shadow-2xl" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-base)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            <ScanLine className="h-5 w-5 text-primary" />
            扫描库
          </h2>
          <button onClick={() => !scanning && onClose()} className="rounded p-1" style={{ color: 'var(--text-secondary)' }}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {hasSubFolders && (
          <div className="mb-4">
            <p className="mb-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>扫描范围</p>
            <p className="mb-2 text-xs" style={{ color: 'var(--text-muted)' }}>漫画目录下按序号分了子文件夹？选单个文件夹可加快扫描。</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => pickScope('all')}
                className={clsx(
                  'rounded-full border px-3 py-1.5 text-xs transition-colors',
                  scope === 'all' ? 'border-primary bg-primary/10 text-primary' : ''
                )}
                style={scope !== 'all' ? { borderColor: 'var(--border-light)', color: 'var(--text-secondary)' } : undefined}
              >
                全部
              </button>
              {folders.map((f) => (
                <button
                  key={f}
                  onClick={() => pickScope(f)}
                  className={clsx(
                    'flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs transition-colors',
                    scope === f ? 'border-primary bg-primary/10 text-primary' : ''
                  )}
                  style={scope !== f ? { borderColor: 'var(--border-light)', color: 'var(--text-secondary)' } : undefined}
                >
                  {scope === f && <Check className="h-3 w-3" />}
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}

        {scanning && progress && progress.total > 0 && (
          <div className="mb-3">
            <div className="mb-1 flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span>{progress.phase === 'processing' ? `正在处理 ${progress.processed} / ${progress.total} 部漫画` : '正在扫描目录...'}</span>
              <span>{Math.round((progress.processed / progress.total) * 100)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: 'var(--bg-surface-hover)' }}>
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progress.total > 0 ? Math.round((progress.processed / progress.total) * 100) : 0}%` }}
              />
            </div>
            {progress.phase === 'processing' && progress.current && (
              <p className="mt-1 truncate text-xs" style={{ color: 'var(--text-muted)' }}>{progress.current}</p>
            )}
          </div>
        )}

        {message && (
          <p className="mb-3 rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
            {message}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={() => !scanning && onClose()}
            disabled={scanning}
            className="rounded-lg border px-4 py-2 text-sm"
            style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
          >
            关闭
          </button>
          <button
            onClick={handleScan}
            disabled={scanning}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-hover disabled:opacity-50"
          >
            <ScanLine className={clsx('h-4 w-4', scanning && 'animate-spin')} />
            {scanning ? '扫描中...' : '开始扫描'}
          </button>
        </div>
      </div>
    </div>
  )
}
