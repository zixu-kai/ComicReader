import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { useComicStore } from '@/stores/comicStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { ratingsApi, progressApi, comicsApi, chaptersApi, bookmarksApi } from '@/services/api'
import { StarRating } from '@/components/StarRating'
import { TagCloud } from '@/components/TagCloud'
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  User,
  Play,
  Edit3,
  Trash2,
  HardDrive,
  Tag,
  Image,
  Upload,
  X,
  Bookmark as BookmarkIcon,
  Download,
} from 'lucide-react'
import type { Rating, ReadingProgress, Bookmark } from '@/types'

export default function ComicDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentComic, chapters, fetchComic, deleteComic } = useComicStore()
  const { categories, tags, fetchCategories, fetchTags } = useCategoryStore()
  const [rating, setRating] = useState<Rating | null>(null)
  const [readingStatus, setReadingStatus] = useState<string>('unread')
  const [readingProgress, setReadingProgress] = useState<ReadingProgress | null>(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [showCoverModal, setShowCoverModal] = useState(false)
  const [coverPageCount, setCoverPageCount] = useState(0)
  const [coverUploading, setCoverUploading] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({ title: '', author: '', artist: '', description: '', status: 'unknown' as 'ongoing' | 'completed' | 'unknown', categoryIds: [] as number[], tagIds: [] as number[] })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const comicId = Number(id)

  const showToast = (message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast(message)
    toastTimerRef.current = setTimeout(() => setToast(null), 2000)
  }

  useEffect(() => {
    if (comicId) {
      fetchComic(comicId)
      ratingsApi.get(comicId).then((r) => {
        setRating(r)
        if (r?.readingStatus) setReadingStatus(r.readingStatus)
      }).catch(() => {})
      progressApi.get(comicId).then(setReadingProgress).catch(() => {})
      fetchCategories(true)
      fetchTags()
      bookmarksApi.list().then((bookmarks: Bookmark[]) => {
        const bm = bookmarks[0]
        if (bm) {
          setIsBookmarked(bm.comics?.includes(comicId) ?? false)
        }
      }).catch(() => {})
    }
  }, [comicId])

  if (!currentComic) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const comic = currentComic
  const comicCategories = comic.categories?.map((c) => categories.find((cat) => cat.id === c.id)).filter(Boolean) ?? []
  const comicTags = comic.tags?.map((t) => tags.find((tag) => tag.id === t.id)).filter(Boolean) ?? []

  const handleStartReading = () => {
    if (chapters.length === 0) return
    const firstChapter = chapters[0]
    if (readingProgress && !readingProgress.isCompleted) {
      navigate(`/reader/${comicId}/${readingProgress.chapterId}`)
    } else {
      navigate(`/reader/${comicId}/${firstChapter!.id}`)
    }
  }

  const handleDelete = async () => {
    if (confirm('确定要删除这部漫画吗？')) {
      await deleteComic(comicId)
      navigate('/library')
    }
  }

  const handleRate = async (score: number) => {
    const newRating = await ratingsApi.set(comicId, score, readingStatus)
    setRating(newRating)
  }

  const handleStatusChange = async (status: string) => {
    setReadingStatus(status)
    const newRating = await ratingsApi.set(comicId, rating?.score ?? 0, status)
    setRating(newRating)
  }

  const handleToggleBookmark = async () => {
    try {
      const bmList = await bookmarksApi.list()
      const bm = bmList[0]
      if (!bm) return
      const bid = bm.id
      if (isBookmarked) {
        await bookmarksApi.removeComic(bid, comicId)
        setIsBookmarked(false)
        showToast('已取消收藏')
      } else {
        await bookmarksApi.addComic(bid, comicId)
        setIsBookmarked(true)
        showToast('已添加收藏')
      }
    } catch {
      showToast('操作失败，请重试')
    }
  }

  const openCoverModal = async () => {
    const firstChapter = chapters[0]
    if (firstChapter) {
      try {
        const res = await chaptersApi.getPages(firstChapter.id)
        setCoverPageCount(res.pages)
      } catch {
        setCoverPageCount(0)
      }
    }
    setShowCoverModal(true)
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverUploading(true)
    try {
      await comicsApi.uploadCover(comicId, file)
      await fetchComic(comicId)
      setShowCoverModal(false)
    } catch {
      alert('封面上传失败')
    } finally {
      setCoverUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSetCoverFromPage = async (pageNum: number) => {
    setCoverUploading(true)
    try {
      await comicsApi.setCoverFromPage(comicId, pageNum)
      await fetchComic(comicId)
      setShowCoverModal(false)
    } catch {
      alert('设置封面失败')
    } finally {
      setCoverUploading(false)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  const statusLabel = comic.status === 'ongoing' ? '连载中' : comic.status === 'completed' ? '已完结' : '未知'

  return (
    <div className="space-y-6">
      {toast && (
        <div
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 rounded-lg border px-4 py-2 text-sm shadow-lg animate-fade-in"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
        >
          {toast}
        </div>
      )}
      <button
        onClick={() => navigate('/library')}
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
          <img
            src={comicsApi.getCoverUrl(comicId, comic.updatedAt)}
            alt={comic.title}
            className="comic-cover w-full rounded-lg shadow-xl"
          />
          <button
            onClick={openCoverModal}
            className="absolute inset-0 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ backgroundColor: 'var(--overlay)' }}
          >
            <Image className="h-5 w-5 mr-1" style={{ color: 'var(--text-primary)' }} />
            <span className="text-xs" style={{ color: 'var(--text-primary)' }}>更换封面</span>
          </button>
        </div>

        <div className="flex-1 space-y-4">
          <h1 className="text-2xl font-bold md:text-3xl" style={{ color: 'var(--text-primary)' }}>{comic.title}</h1>

          {comic.author && (
            <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <User className="h-4 w-4" />
              <Link
                to={`/library?author=${encodeURIComponent(comic.author)}`}
                className="hover:text-primary transition-colors"
              >
                {comic.author}
              </Link>
              {comic.artist && comic.artist !== comic.author && (
                <span style={{ color: 'var(--text-muted)' }}>/ {comic.artist} (画师)</span>
              )}
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <StarRating
                score={rating?.score ?? 0}
                size="lg"
                interactive
                onRate={handleRate}
              />
              {rating && <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{rating.score}/5</span>}
            </div>
            <select
              value={readingStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="rounded border px-2 py-1 text-xs outline-none"
              style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}
            >
              <option value="unread">未读</option>
              <option value="reading">在读</option>
              <option value="read">已读</option>
              <option value="dropped">弃读</option>
            </select>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              comic.status === 'ongoing' ? 'bg-accent-green/10 text-accent-green' :
              comic.status === 'completed' ? 'bg-accent-blue/10 text-accent-blue' :
              ''
            }`}
            style={comic.status === 'unknown' ? { backgroundColor: 'var(--bg-surface-active)', color: 'var(--text-secondary)' } : undefined}
            >
              {statusLabel}
            </span>
          </div>

          {comic.description && (
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{comic.description}</p>
          )}

          <div className="flex flex-wrap gap-3 text-sm" style={{ color: 'var(--text-muted)' }}>
            {comic.year && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{comic.year}年</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              <span>{comic.pageCount}页</span>
            </div>
            <div className="flex items-center gap-1">
              <HardDrive className="h-3.5 w-3.5" />
              <span>{formatSize(comic.fileSize)}</span>
            </div>
            <span className="rounded px-2 py-0.5 text-xs uppercase" style={{ backgroundColor: 'var(--bg-surface)' }}>{comic.fileType}</span>
          </div>

          {comicCategories.length > 0 && (
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
              <div className="flex flex-wrap gap-1.5">
                {comicCategories.map((cat) => (
                  <Link
                    key={cat!.id}
                    to={`/library?categoryId=${cat!.id}`}
                    className="rounded-full px-2.5 py-0.5 text-xs"
                    style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-surface)'
                    }}
                  >
                    {cat!.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {comicTags.length > 0 && (
            <TagCloud tags={comicTags as NonNullable<typeof tags>} linkMode />
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleStartReading}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
            >
              <Play className="h-4 w-4" />
              {readingProgress && !readingProgress.isCompleted ? '继续阅读' : '开始阅读'}
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
              onClick={() => {
                setEditForm({
                  title: comic.title || '',
                  author: comic.author || '',
                  artist: comic.artist || '',
                  description: comic.description || '',
                  status: comic.status || 'unknown',
                  categoryIds: comic.categories?.map((c) => c.id) ?? [],
                  tagIds: comic.tags?.map((t) => t.id) ?? [],
                })
                setShowEditModal(true)
              }}
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
              onClick={() => comicsApi.download(comicId)}
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

      {chapters.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>章节列表</h2>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {chapters.map((chapter) => {
              const isCurrent = readingProgress?.chapterId === chapter.id
              return (
                <Link
                  key={chapter.id}
                  to={`/reader/${comicId}/${chapter.id}`}
                  className={`flex items-center justify-between rounded-lg border px-4 py-3 text-sm transition-colors ${
                    isCurrent
                      ? 'border-primary bg-primary/10 text-primary'
                      : ''
                  }`}
                  style={isCurrent ? undefined : {
                    borderColor: 'var(--border-light)',
                    color: 'var(--text-secondary)',
                  }}
                  onMouseEnter={isCurrent ? undefined : (e) => {
                    e.currentTarget.style.borderColor = 'var(--border-default)'
                    e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'
                  }}
                  onMouseLeave={isCurrent ? undefined : (e) => {
                    e.currentTarget.style.borderColor = 'var(--border-light)'
                    e.currentTarget.style.backgroundColor = ''
                  }}
                >
                  <span className="truncate">
                    {chapter.title || `第 ${chapter.chapterNumber} 话`}
                  </span>
                  <span className="ml-2 shrink-0 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {chapter.pageCount}页
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
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

            <div className="mb-4">
              <h3 className="mb-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>上传封面图片</h3>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={coverUploading}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed py-4 text-sm disabled:opacity-50"
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
                <Upload className="h-4 w-4" />
                {coverUploading ? '上传中...' : '点击上传图片'}
              </button>
            </div>

            {coverPageCount > 0 && chapters[0] && (
              <div>
                <h3 className="mb-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>从章节选择封面 ({coverPageCount}页)</h3>
                <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                  {Array.from({ length: Math.min(coverPageCount, 48) }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handleSetCoverFromPage(pageNum)}
                      disabled={coverUploading}
                      className="overflow-hidden rounded border hover:border-primary disabled:opacity-50 aspect-[3/4]"
                      style={{ borderColor: 'var(--border-default)' }}
                    >
                      <img
                        src={chaptersApi.getPageImageUrl(chapters[0]!.id, pageNum)}
                        alt={`第${pageNum}页`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'var(--overlay)' }} onClick={() => setShowEditModal(false)}>
          <div className="w-full max-w-lg rounded-xl border p-6 shadow-2xl" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-base)' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>编辑信息</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="rounded p-1"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>标题</label>
                <input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-primary" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>作者</label>
                  <input value={editForm.author} onChange={(e) => setEditForm({ ...editForm, author: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-primary" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>画师</label>
                  <input value={editForm.artist} onChange={(e) => setEditForm({ ...editForm, artist: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-primary" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }} />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>简介</label>
                <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={4} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-primary resize-none" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>状态</label>
                <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value as 'ongoing' | 'completed' | 'unknown' })} className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-primary" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
                  <option value="unknown">未知</option>
                  <option value="ongoing">连载中</option>
                  <option value="completed">已完结</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>分类</label>
                <div className="flex flex-wrap gap-2 rounded-lg border p-3 max-h-40 overflow-y-auto" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-surface)' }}>
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-1.5 text-sm cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                      <input
                        type="checkbox"
                        checked={editForm.categoryIds.includes(cat.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditForm({ ...editForm, categoryIds: [...editForm.categoryIds, cat.id] })
                          } else {
                            setEditForm({ ...editForm, categoryIds: editForm.categoryIds.filter((id) => id !== cat.id) })
                          }
                        }}
                      />
                      {cat.name}
                    </label>
                  ))}
                  {categories.length === 0 && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>暂无分类</span>}
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>标签</label>
                <div className="flex flex-wrap gap-2 rounded-lg border p-3 max-h-40 overflow-y-auto" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-surface)' }}>
                  {tags.map((tag) => (
                    <label key={tag.id} className="flex items-center gap-1.5 text-sm cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                      <input
                        type="checkbox"
                        checked={editForm.tagIds.includes(tag.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditForm({ ...editForm, tagIds: [...editForm.tagIds, tag.id] })
                          } else {
                            setEditForm({ ...editForm, tagIds: editForm.tagIds.filter((id) => id !== tag.id) })
                          }
                        }}
                      />
                      {tag.name}
                    </label>
                  ))}
                  {tags.length === 0 && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>暂无标签</span>}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="rounded-lg border px-4 py-2 text-sm"
                  style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >取消</button>
                <button onClick={async () => {
                  try {
                    await comicsApi.update(comicId, editForm)
                    await fetchComic(comicId)
                    setShowEditModal(false)
                    showToast('已保存修改')
                  } catch { showToast('保存失败') }
                }} className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-hover">保存</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
