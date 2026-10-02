import { useEffect, useState } from 'react'
import { useCategoryStore } from '@/stores/categoryStore'
import {
  Pencil,
  Trash2,
  FolderPlus,
  X,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'
import type { Category } from '@/types'

export default function CategoriesPage() {
  const { categories, tags, fetchCategories, fetchTags, createCategory, updateCategory, deleteCategory, toggleCategoryHidden, createTag, moveTag, batchDeleteTags, deleteTag } = useCategoryStore()
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDesc, setNewCategoryDesc] = useState('')
  const [newTagName, setNewTagName] = useState('')
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])

  useEffect(() => {
    fetchCategories(true)
    fetchTags()
  }, [])

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
    if (confirm('确定要删除此标签吗？')) {
      await deleteTag(id)
      setSelectedTagIds((prev) => prev.filter((x) => x !== id))
    }
  }

  const handleMoveTag = async (id: number, direction: 'up' | 'down') => {
    await moveTag(id, direction)
  }

  const handleBatchDeleteTags = async () => {
    if (selectedTagIds.length === 0) return
    if (confirm(`确定删除选中的 ${selectedTagIds.length} 个标签吗？`)) {
      await batchDeleteTags(selectedTagIds)
      setSelectedTagIds([])
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
              disabled={selectedTagIds.length === 0}
              className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs transition-colors disabled:opacity-40"
              style={{ borderColor: 'rgba(239, 68, 68, 0.35)', color: 'var(--accent-red)' }}
            >
              <Trash2 className="h-3 w-3" />
              删除选中
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
              {tags.map((tag, index) => {
                const isSelected = selectedTagIds.includes(tag.id)
                const isFirst = index === 0
                const isLast = index === tags.length - 1
                return (
                  <div
                    key={tag.id}
                    className="flex items-center gap-3 px-4 py-2.5 transition-colors"
                    style={{ backgroundColor: isSelected ? 'rgba(var(--primary-rgb), 0.08)' : 'transparent' }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)' }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent' }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectTag(tag.id)}
                      className="accent-primary shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{tag.name}</span>
                      {tag.comicCount !== undefined && tag.comicCount > 0 && (
                        <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>{tag.comicCount} 部</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveTag(tag.id, 'up')}
                        disabled={isFirst}
                        className="rounded p-1.5 transition-colors disabled:opacity-25"
                        style={{ color: 'var(--text-muted)' }}
                        title="上移"
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-active)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveTag(tag.id, 'down')}
                        disabled={isLast}
                        className="rounded p-1.5 transition-colors disabled:opacity-25"
                        style={{ color: 'var(--text-muted)' }}
                        title="下移"
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-active)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTag(tag.id)}
                        className="rounded p-1.5 transition-colors hover:text-accent-red"
                        style={{ color: 'var(--text-muted)' }}
                        title="删除"
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-active)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                      >
                        <X className="h-3.5 w-3.5" />
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
