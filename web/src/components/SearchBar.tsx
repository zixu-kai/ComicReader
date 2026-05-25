import { useState, useCallback, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { useNavigate } from 'react-router'

interface SearchBarProps {
  onSearch?: (query: string) => void
  placeholder?: string
  initialQuery?: string
  className?: string
}

export function SearchBar({
  onSearch,
  placeholder = '搜索漫画...',
  initialQuery = '',
  className = '',
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (query.trim()) {
        if (onSearch) {
          onSearch(query.trim())
        } else {
          navigate(`/library?query=${encodeURIComponent(query.trim())}`)
        }
      }
    },
    [query, onSearch, navigate]
  )

  const handleClear = useCallback(() => {
    setQuery('')
    inputRef.current?.focus()
  }, [])

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {}}
        onBlur={() => {}}
        placeholder={placeholder}
        className="w-full rounded-lg border py-2 pl-9 pr-9 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
        style={{
          borderColor: 'var(--border-light)',
          backgroundColor: 'var(--bg-surface-hover)',
          color: 'var(--text-primary)'
        }}
      />
      <style>{`input::placeholder { color: var(--text-muted); }`}</style>
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:text-white"
          style={{ color: 'var(--text-muted)' }}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  )
}
