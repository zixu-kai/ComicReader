import { useEffect, useState, useCallback } from 'react'
import { authApi, setAuthToken } from '@/services/api'

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true)
  const [enabled, setEnabled] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(() => {
    setAuthed(!!localStorage.getItem('ownShelfToken'))
  }, [])

  useEffect(() => {
    authApi.getStatus().then((res) => {
      setEnabled(res.enabled)
      refresh()
    }).catch(() => {
      setEnabled(false)
    }).finally(() => {
      setChecking(false)
    })

    const onAuthRequired = () => {
      setAuthed(false)
      refresh()
    }
    window.addEventListener('ownShelfAuthRequired', onAuthRequired)
    return () => window.removeEventListener('ownShelfAuthRequired', onAuthRequired)
  }, [refresh])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await authApi.login(password)
      setAuthToken(res.token)
      setAuthed(true)
      setPassword('')
    } catch {
      setError('密码错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: 'var(--bg-base)' }}>
        <div className="animate-spin h-8 w-8 rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!enabled || authed) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-base)' }}>
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm rounded-xl border p-8 shadow-xl"
        style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-surface)' }}
      >
        <h1 className="mb-1 text-center text-xl font-bold" style={{ color: 'var(--text-primary)' }}>私阁</h1>
        <p className="mb-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>请输入访问密码</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="访问密码"
          autoFocus
          className="mb-3 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
          style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-surface-hover)', color: 'var(--text-primary)' }}
        />
        {error && <p className="mb-3 text-center text-xs" style={{ color: 'var(--accent-red)' }}>{error}</p>}
        <button
          type="submit"
          disabled={loading || !password.trim()}
          className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
        >
          {loading ? '验证中...' : '进入'}
        </button>
      </form>
    </div>
  )
}
