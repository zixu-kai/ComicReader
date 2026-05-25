import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useBookStore } from '@/stores/bookStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { bookRatingsApi, bookmarksApi, booksApi } from '@/services/api'
import { StarRating } from '@/components/StarRating'
import {
  ArrowLeft,
  Book as BookIcon,
  Calendar,
  Building,
  Globe,
  Hash,
  Play,
  Bookmark as BookmarkIcon,
  Image,
  Upload,
  X,
  Edit3,
  Trash2,
  Download,
  FileDown,
  HardDrive,
  List,
} from 'lucide-react'
import { BookEditModal } from '@/components/BookEditModal'
import type { Bookmark } from '@/types'

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentBook, fetchBook, deleteBook } = useBookStore()
  const { tags, fetchTags, categories, fetchCategories } = useCategoryStore()
  const [score, setScore] = useState(0)
  const [readingStatus, setReadingStatus] = useState<string>('unread')
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [showCoverModal, setShowCoverModal] = useState(false)
  const [coverUploading, setCoverUploading] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editInitial, setEditInitial] = useState({ title: '', author: '', description: '', publisher: '', language: '', isbn: '', tagIds: [] as number[], categoryIds: [] as number[] })
  const [bookChapters, setBookChapters] = useState<{ title: string; startPos: number }[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const bookId = Number(id)

  const showToast = (message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast(message)
    toastTimerRef.current = setTimeout(() => setToast(null), 2000)
  }

  useEffect(() => {
    if (bookId) fetchBook(bookId)
  }, [bookId])

  useEffect(() => {
    fetchTags()
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (!bookId) return
    bookmarksApi.list().then((bookmarks: Bookmark[]) => {
      const isInAny = bookmarks.some((b: Bookmark & { books?: number[] }) => b.books?.includes(bookId))
      setIsBookmarked(isInAny)
    }).catch(() => {})
  }, [bookId])

  useEffect(() => {
    if (currentBook?.rating) {
      setScore(currentBook.rating.score)
      setReadingStatus(currentBook.rating.readingStatus)
    }
  }, [currentBook?.rating])

  useEffect(() => {
    if (bookId && currentBook?.format) {
      booksApi.getChapters(bookId).then(setBookChapters).catch(() => setBookChapters([]))
    }
  }, [bookId, currentBook?.format])

  useEffect(() => {
    const handleFocus = () => {
      if (bookId && currentBook?.format) {
        booksApi.getChapters(bookId).then(setBookChapters).catch(() => setBookChapters([]))
      }
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [bookId, currentBook?.format])

  if (!currentBook) {
    return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 rounded-full border-2 border-primary border-t-transparent" /></div>
  }

  const book = currentBook

  const handleStartReading = () => {
    navigate(`/book-reader/${bookId}`)
  }

  const handleScoreChange = async (newScore: number) => {
    setScore(newScore)
    await bookRatingsApi.set(bookId, newScore, readingStatus)
  }

  const handleStatusChange = async (status: string) => {
    setReadingStatus(status)
    await bookRatingsApi.set(bookId, score, status)
  }

  const handleToggleBookmark = async () => {
    try {
      const bmList = await bookmarksApi.list()
      const bm = bmList[0]
      if (!bm) return
      if (isBookmarked) {
        await bookmarksApi.removeBook(bm.id, bookId)
        setIsBookmarked(false)
        showToast('已取消收藏')
      } else {
        await bookmarksApi.addBook(bm.id, bookId)
        setIsBookmarked(true)
        showToast('已添加收藏')
      }
    } catch {
      showToast('操作失败，请重试')
    }
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverUploading(true)
    try {
      await booksApi.uploadCover(bookId, file)
      await fetchBook(bookId)
      setShowCoverModal(false)
      showToast('封面已更新')
    } catch {
      showToast('封面上传失败')
    } finally {
      setCoverUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = async () => {
    if (confirm('确定要删除这本书吗？')) {
      await deleteBook(bookId)
      navigate('/books')
    }
  }

  const handleEdit = () => {
    setEditInitial({
      title: book.title || '',
      author: book.author || '',
      description: book.description || '',
      publisher: book.publisher || '',
      language: book.language || '',
      isbn: book.isbn || '',
      tagIds: book.tags?.map((t) => t.id) ?? [],
      categoryIds: book.categories?.map((c) => c.id) ?? [],
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = async (data: typeof editInitial) => {
    await booksApi.update(bookId, data)
    await fetchBook(bookId)
    setShowEditModal(false)
    showToast('已保存修改')
  }

  const formatLabel: Record<string, string> = {
    epub: 'EPUB', pdf: 'PDF', txt: 'TXT', mobi: 'MOBI', azw3: 'AZW3',
  }

  const statusLabels: Record<string, string> = {
    unread: '未读', reading: '在读', read: '已读', dropped: '弃读',
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 rounded-lg border px-4 py-2 text-sm shadow-lg"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
        >
          {toast}
        </div>
      )}

      <button
        onClick={() => navigate('/books')}
        className="flex items-center gap-2 text-sm"
        style={{ color: 'var(--text-secondary)' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
      >
        <ArrowLeft className="h-4 w-4" />
        返回
      </button>

      <div className="flex flex-col gap-6 md:flex-row">
        <div className="w-48 shrink-0 md:w-56 relative group">
          {book.coverPath ? (
            <img
              src={booksApi.getCoverUrl(bookId, book.updatedAt)}
              alt={book.title}
              className="comic-cover w-full rounded-lg shadow-xl"
            />
          ) : (
            <div className="flex h-72 w-full items-center justify-center rounded-lg" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <BookIcon className="h-16 w-16" style={{ color: 'var(--text-muted)' }} />
            </div>
          )}
          <button
            onClick={() => setShowCoverModal(true)}
            className="absolute inset-0 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ backgroundColor: 'var(--overlay)' }}
          >
            <Image className="h-5 w-5 mr-1" style={{ color: 'var(--text-primary)' }} />
            <span className="text-xs" style={{ color: 'var(--text-primary)' }}>更换封面</span>
          </button>
        </div>

        <div className="flex-1 space-y-4">
          <h1 className="text-2xl font-bold md:text-3xl" style={{ color: 'var(--text-primary)' }}>{book.title}</h1>

          {book.author && (
            <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <span>{book.author}</span>
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <StarRating score={score} size="lg" interactive onRate={handleScoreChange} />
              {score > 0 && <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{score}/5</span>}
            </div>
            <select
              value={readingStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="rounded border px-2 py-1 text-xs outline-none"
              style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}
            >
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {book.description && (
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{book.description}</p>
          )}

          <div className="flex flex-wrap gap-3 text-sm" style={{ color: 'var(--text-muted)' }}>
            {book.format && (
              <span className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs" style={{ borderColor: 'var(--border-default)' }}>
                {formatLabel[book.format]}
              </span>
            )}
            {book.publisher && (
              <span className="flex items-center gap-1"><Building className="h-3.5 w-3.5" />{book.publisher}</span>
            )}
            {book.publishDate && (
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{book.publishDate}</span>
            )}
            {book.language && (
              <span className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" />{book.language}</span>
            )}
            {book.isbn && (
              <span className="flex items-center gap-1"><Hash className="h-3.5 w-3.5" />{book.isbn}</span>
            )}
            {book.fileSize > 0 && (
              <span className="flex items-center gap-1"><HardDrive className="h-3.5 w-3.5" />{formatSize(book.fileSize)}</span>
            )}
          </div>

          {book.tags && book.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {book.tags.map((tag) => (
                <span key={tag.id} className="rounded-full border px-3 py-1 text-xs" style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}>
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleStartReading}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
            >
              <Play className="h-4 w-4" />
              {book.readingProgress && !book.readingProgress.isCompleted ? '继续阅读' : '开始阅读'}
            </button>
            <button
              onClick={handleToggleBookmark}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                isBookmarked
                  ? 'border-primary bg-primary/10 text-primary'
                  : ''
              }`}
              style={isBookmarked ? undefined : {
                borderColor: 'var(--border-default)',
                color: 'var(--text-secondary)',
              }}
              onMouseEnter={isBookmarked ? undefined : (e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'
                e.currentTarget.style.color = 'var(--text-primary)'
              }}
              onMouseLeave={isBookmarked ? undefined : (e) => {
                e.currentTarget.style.backgroundColor = ''
                e.currentTarget.style.color = 'var(--text-secondary)'
              }}
            >
              <BookmarkIcon className={`h-4 w-4 ${isBookmarked ? 'fill-primary' : ''}`} />
              {isBookmarked ? '已收藏' : '收藏'}
            </button>
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors"
              style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'
                e.currentTarget.style.color = 'var(--text-primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = ''
                e.currentTarget.style.color = 'var(--text-secondary)'
              }}
            >
              <Edit3 className="h-4 w-4" />
              编辑
            </button>
            <button
              onClick={() => booksApi.download(bookId)}
              className="flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors"
              style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'
                e.currentTarget.style.color = 'var(--text-primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = ''
                e.currentTarget.style.color = 'var(--text-secondary)'
              }}
            >
              <Download className="h-4 w-4" />
              下载
            </button>
            {book.format === 'txt' && (
              <button
                onClick={() => booksApi.exportEpub(bookId)}
                className="flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors"
                style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'
                  e.currentTarget.style.color = 'var(--text-primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = ''
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }}
              >
                <FileDown className="h-4 w-4" />
                导出EPUB
              </button>
            )}
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 rounded-lg border border-accent-red/30 px-4 py-2.5 text-sm text-accent-red hover:bg-accent-red/10"
            >
              <Trash2 className="h-4 w-4" />
              删除
            </button>
          </div>
        </div>
      </div>

      {bookChapters.length > 0 && (
        <div className="mt-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            <List className="h-5 w-5" />
            目录
            <span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}>({bookChapters.length}章)</span>
          </h2>
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {bookChapters.map((ch, i) => (
              <button
                key={i}
                onClick={() => navigate(`/book-reader/${bookId}?chapter=${i}`)}
                className="text-left rounded-lg border px-3 py-2 text-sm transition-colors truncate"
                style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-base)', color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-default)'
                  e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'
                  e.currentTarget.style.color = 'var(--text-primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-light)'
                  e.currentTarget.style.backgroundColor = 'var(--bg-base)'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }}
              >
                {ch.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {showCoverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'var(--overlay)' }} onClick={() => setShowCoverModal(false)}>
          <div className="w-full max-w-md rounded-xl border p-6 shadow-2xl" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-base)' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>更换封面</h2>
              <button
                onClick={() => setShowCoverModal(false)}
                className="rounded p-1"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={coverUploading}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed py-8 text-sm disabled:opacity-50"
              style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary)'
                e.currentTarget.style.color = 'var(--color-primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-default)'
                e.currentTarget.style.color = 'var(--text-secondary)'
              }}
            >
              <Upload className="h-5 w-5" />
              {coverUploading ? '上传中...' : '点击上传封面图片'}
            </button>
          </div>
        </div>
      )}

      {showEditModal && (
        <BookEditModal
          initial={editInitial}
          tags={tags}
          categories={categories}
          onSave={handleSaveEdit}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  )
}
