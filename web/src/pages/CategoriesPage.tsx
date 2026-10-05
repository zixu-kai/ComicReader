import { useEffect, useState } from 'react'
import { useCategoryStore } from '@/stores/categoryStore'
import { useNavigate } from 'react-router'
import {
  Pencil,
  Trash2,
  FolderPlus,
  X,
  Eye,
  EyeOff,
  GripVertical,
} from 'lucide-react'
import type { Category, Tag } from '@/types'

export default function CategoriesPage() {
  const navigate = useNavigate()
  const { categories, tags, fetchCategories, fetchTags, createCategory, updateCategory, deleteCategory, toggleCategoryHidden, createTag, reorderTags, batchDeleteTags, deleteTag } = useCategoryStore()
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDesc, setNewCategoryDesc] = useState('')
  const [newTagName, setNewTagName] = useState('')
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [deletingTagId, setDeletingTagId] = useState<number | null>(null)
  const [deletingBatch, setDeletingBatch] = useState(false)

  // 拖拽排序相关状态
  const [dragId, setDragId] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [dragList, setDragList] = useState<Tag[] | null>(null)

  useEffect(() => {
    fetchCategories(true)
    fetchTags()
  }, [])

  useEffect(() => {
    setDragList(null)
  }, [tags])

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return
    await createCategory({ name: newCategoryName.trim(), description: newCategoryDesc.trim() || null })
    setNewCategoryName('')
    setNewCategoryDesc('')
    setShowAddCategory(false)
  }

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editName.trim()) return
    await updateCategory(editingCategory.id, { name: editName.trim(), description: editDesc.trim() || null })
    setEditingCategory(null)
  }

  const handleDeleteCategory = async (id: number) => {
    if (confirm('确定要删除此分类吗？')) {
      await deleteCategory(id)
    }
  }

  const handleDeleteTag = async (id: number) => {
    if (confirm('确定要删除此标签吗？\n\n相关漫画的 ComicInfo.xml 会同步移除该标签。')) {
      setDeletingTagId(id)
      try {
        await deleteTag(id)
        setSelectedTagIds((prev) => prev.filter((x) => x !== id))
      } finally {
        setDeletingTagId(null)
      }
    }
  }

  const handleDragStart = (e: React.DragEvent, tag: Tag) => {
    e.dataTransfer.effectAllowed = 'move'
    setDragId(tag.id)
    setDragList(tags)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (dragId === null) return
    setDragOverIndex(index)
    setDragList((prev) => {
      const base = prev ?? tags
      const rest = base.filter((t) => t.id !== dragId)
      const dragged = base.find((t) => t.id === dragId)
      if (!dragged) return base
      const next = [...rest]
      next.splice(Math.min(index, next.length), 0, dragged)
      return next
    })
  }

  const handleDrop = async () => {
    if (dragId === null) return
    const ids = (dragList ?? tags).map((t) => t.id)
    setDragId(null)
    setDragOverIndex(null)
    setDragList(null)
    await reorderTags(ids)
  }

  const handleDragEnd = () => {
    setDragId(null)
    setDragOverIndex(null)
    setDragList(null)
  }

  const handleBatchDeleteTags = async () => {
    if (selectedTagIds.length === 0) return
    if (confirm(`确定删除选中的 ${selectedTagIds.length} 个标签吗？\n\n相关漫画的 ComicInfo.xml 会同步移除这些标签。`)) {
      setDeletingBatch(true)
      try {
        await batchDeleteTags(selectedTagIds)
        setSelectedTagIds([])
      } finally {
        setDeletingBatch(false)
      }
    }
  }

  const toggleSelectTag = (id: number) => {
    setSelectedTagIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const toggleSelectAllTags = () => {
    setSelectedTagIds((prev) => (prev.length === tags.length ? [] : tags.map((t) => t.id)))
  }

  const handleAddTag = async () => {
    if (!newTagName.trim()) return
    await createTag(newTagName.trim())
    setNewTagName('')
  }

  const startEditing = (cat: Category) => {
    setEditingCategory(cat)
    setEditName(cat.name)
    setEditDesc(cat.description ?? '')
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>分类管理</h2>
          <button
            onClick={() => setShowAddCategory(!showAddCategory)}
            className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm hover:bg-primary-hover"
            style={{ color: 'var(--text-primary)' }}
          >
            <FolderPlus className="h-4 w-4" />
            新增分类
          </button>
        </div>

        {showAddCategory && (
          <div className="mb-4 rounded-lg border p-4 space-y-3" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-surface)' }}>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="分类名称"
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-primary"
              style={{
                borderColor: 'var(--border-light)',
                backgroundColor: 'var(--bg-surface-hover)',
                color: 'var(--text-primary)'
              }}
            />
            <input
              type="text"
              value={newCategoryDesc}
              onChange={(e) => setNewCategoryDesc(e.target.value)}
              placeholder="分类描述（可选）"
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-primary"
              style={{
                borderColor: 'var(--border-light)',
                backgroundColor: 'var(--bg-surface-hover)',
                color: 'var(--text-primary)'
              }}
            />
            <style>{`input::placeholder { color: var(--text-muted); }`}</style>
            <div className="flex gap-2">
              <button
                onClick={handleAddCategory}
                className="rounded-lg bg-primary px-4 py-2 text-sm hover:bg-primary-hover"
                style={{ color: 'var(--text-primary)' }}
              >
                创建
              </button>
              <button
                onClick={() => { setShowAddCategory(false); setNewCategoryName(''); setNewCategoryDesc('') }}
                className="rounded-lg border px-4 py-2 text-sm transition-colors hover:text-white"
                style={{ borderColor: 'var(--border-light)', color: 'var(--text-secondary)' }}
              >
                取消
              </button>
            </div>
          </div>
        )}

        {editingCategory && (
          <div className="mb-4 rounded-lg border p-4 space-y-3" style={{ borderColor: 'rgba(var(--primary-rgb), 0.3)', backgroundColor: 'var(--bg-surface)' }}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-primary">编辑分类</span>
              <button onClick={() => setEditingCategory(null)} className="transition-colors hover:text-white" style={{ color: 'var(--text-secondary)' }}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-primary"
              style={{
                borderColor: 'var(--border-light)',
                backgroundColor: 'var(--bg-surface-hover)',
                color: 'var(--text-primary)'
              }}
            />
            <input
              type="text"
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder="描述（可选）"
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-primary"
              style={{
                borderColor: 'var(--border-light)',
                backgroundColor: 'var(--bg-surface-hover)',
                color: 'var(--text-primary)'
              }}
            />
            <style>{`input::placeholder { color: var(--text-muted); }`}</style>
            <button
              onClick={handleUpdateCategory}
              className="rounded-lg bg-primary px-4 py-2 text-sm hover:bg-primary-hover"
              style={{ color: 'var(--text-primary)' }}
            >
              保存
            </button>
          </div>
        )}

        <div className="rounded-lg border" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-surface)' }}>
          {categories.length === 0 ? (
            <div className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>暂无分类</div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border-default)' }}>
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between px-4 py-3 transition-colors"
                  style={{ opacity: cat.hidden ? 0.5 : 1 }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div className="flex-1">
                    <span className="text-sm" style={{ color: cat.hidden ? 'var(--text-muted)' : 'var(--text-primary)' }}>{cat.name}</span>
                    {cat.description && (
                      <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>{cat.description}</span>
                    )}
                    {cat.comicCount !== undefined && cat.comicCount > 0 && (
                      <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>{cat.comicCount} 部漫画</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleCategoryHidden(cat.id)}
                      className="rounded p-1.5 transition-colors"
                      style={{ color: cat.hidden ? 'var(--text-muted)' : 'var(--primary)' }}
                      title={cat.hidden ? '点击显示分类' : '点击隐藏分类'}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-active)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                    >
                      {cat.hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={() => startEditing(cat)}
                      className="rounded p-1.5 transition-colors hover:text-white"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-active)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="rounded p-1.5 transition-colors hover:text-accent-red"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-active)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>标签管理</h2>
          <div className="flex items-center gap-2">
            {selectedTagIds.length > 0 && (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>已选 {selectedTagIds.length} 个</span>
            )}
            <button
              onClick={toggleSelectAllTags}
              className="rounded-lg border px-3 py-1.5 text-xs transition-colors"
              style={{ borderColor: 'var(--border-light)', color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)' }}
            >
              {selectedTagIds.length === tags.length && tags.length > 0 ? '取消全选' : '全选'}
            </button>
            <button
              onClick={handleBatchDeleteTags}
              disabled={selectedTagIds.length === 0 || deletingBatch}
              className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs transition-colors disabled:opacity-40"
              style={{ borderColor: 'rgba(239, 68, 68, 0.35)', color: 'var(--accent-red)' }}
            >
              {deletingBatch
                ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-accent-red border-t-transparent" />
                : <Trash2 className="h-3 w-3" />}
              {deletingBatch ? '删除中...' : '删除选中'}
            </button>
          </div>
        </div>
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddTag() }}
            placeholder="新标签名称"
            className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:border-primary"
            style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}
          />
          <button
            onClick={handleAddTag}
            className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-hover"
          >
            添加
          </button>
        </div>
        <div className="rounded-lg border" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-surface)' }}>
          {tags.length === 0 ? (
            <div className="py-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>暂无标签</div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border-default)' }}>
              {(dragList ?? tags).map((tag, index) => {
                const isSelected = selectedTagIds.includes(tag.id)
                const isDragging = dragId === tag.id
                const isDragOver = dragOverIndex === index && dragId !== null && dragId !== tag.id
                return (
                  <div
                    key={tag.id}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={() => handleDrop()}
                    className="flex items-center gap-3 px-4 py-2.5 transition-colors"
                    style={{
                      backgroundColor: isSelected
                        ? 'rgba(var(--primary-rgb), 0.08)'
                        : isDragOver
                          ? 'rgba(var(--primary-rgb), 0.15)'
                          : 'transparent',
                      opacity: isDragging ? 0.4 : 1,
                      borderTop: isDragOver ? '2px solid var(--primary)' : undefined,
                    }}
                    onMouseEnter={(e) => { if (!isSelected && !isDragOver) e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)' }}
                    onMouseLeave={(e) => { if (!isSelected && !isDragOver) e.currentTarget.style.backgroundColor = 'transparent' }}
                  >
                    <span
                      draggable
                      onDragStart={(e) => handleDragStart(e, tag)}
                      onDragEnd={handleDragEnd}
                      className="cursor-grab rounded p-1 transition-colors active:cursor-grabbing"
                      style={{ color: 'var(--text-muted)' }}
                      title="按住拖动排序"
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-active)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                    >
                      <GripVertical className="h-4 w-4" />
                    </span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectTag(tag.id)}
                      className="accent-primary shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => navigate(`/library?tagId=${tag.id}`)}
                        className="text-sm transition-colors hover:text-primary"
                        style={{ color: 'var(--text-primary)' }}
                        title="点击筛选该标签的漫画"
                      >
                        {tag.name}
                      </button>
                      {tag.comicCount !== undefined && tag.comicCount > 0 && (
                        <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>{tag.comicCount} 部</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDeleteTag(tag.id)}
                        disabled={deletingTagId !== null}
                        className="rounded p-1.5 transition-colors hover:text-accent-red disabled:opacity-30"
                        style={{ color: 'var(--text-muted)' }}
                        title="删除"
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-active)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                      >
                        {deletingTagId === tag.id
                          ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-accent-red border-t-transparent" />
                          : <X className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
