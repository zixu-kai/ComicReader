import { useState } from 'react'
import { X } from 'lucide-react'
import type { Tag, Category } from '@/types'

interface BookEditModalProps {
  initial: {
    title: string
    author: string
    description: string
    publisher: string
    language: string
    isbn: string
    tagIds: number[]
    categoryIds: number[]
  }
  tags: Tag[]
  categories: Category[]
  onSave: (data: BookEditModalProps['initial']) => Promise<void>
  onClose: () => void
}

export function BookEditModal({ initial, tags, categories, onSave, onClose }: BookEditModalProps) {
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      await onSave(form)
    } catch (e) {
      setError((e as Error).message)
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl border border-gray-700 bg-gray-900 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">编辑信息</h2>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">标题</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">作者</label>
            <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">简介</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-primary resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">出版社</label>
              <input value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">语言</label>
              <input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-primary" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">ISBN</label>
            <input value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">分类</label>
            <div className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 max-h-40 overflow-y-auto">
              {categories.length === 0 && <span className="text-sm text-gray-500">暂无分类</span>}
              {categories.map((category) => (
                <label key={category.id} className="flex items-center gap-2 py-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.categoryIds.includes(category.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setForm({ ...form, categoryIds: [...form.categoryIds, category.id] })
                      } else {
                        setForm({ ...form, categoryIds: form.categoryIds.filter((id) => id !== category.id) })
                      }
                    }}
                    className="accent-primary"
                  />
                  <span className="text-sm text-white">{category.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">标签</label>
            <div className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 max-h-40 overflow-y-auto">
              {tags.length === 0 && <span className="text-sm text-gray-500">暂无标签</span>}
              {tags.map((tag) => (
                <label key={tag.id} className="flex items-center gap-2 py-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.tagIds.includes(tag.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setForm({ ...form, tagIds: [...form.tagIds, tag.id] })
                      } else {
                        setForm({ ...form, tagIds: form.tagIds.filter((id) => id !== tag.id) })
                      }
                    }}
                    className="accent-primary"
                  />
                  <span className="text-sm text-white">{tag.name}</span>
                </label>
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={onClose} className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-400 hover:text-white" disabled={saving}>取消</button>
            <button onClick={handleSave} disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-hover disabled:opacity-50">
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}