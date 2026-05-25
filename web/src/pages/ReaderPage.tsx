import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Reader } from '@/components/Reader'
import { useComicStore } from '@/stores/comicStore'
import { chaptersApi } from '@/services/api'

export default function ReaderPage() {
  const { comicId, chapterId } = useParams<{ comicId: string; chapterId: string }>()
  const navigate = useNavigate()
  const { fetchComic } = useComicStore()
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)

  const cId = Number(comicId)
  const chId = Number(chapterId)

  useEffect(() => {
    if (cId) {
      fetchComic(cId)
    }
  }, [cId])

  useEffect(() => {
    if (chId) {
      setLoading(true)
      chaptersApi.getPages(chId)
        .then((res) => {
          setTotalPages(res.pages)
          setLoading(false)
        })
        .catch(() => {
          setTotalPages(0)
          setLoading(false)
        })
    }
  }, [chId])

  const handleClose = () => {
    navigate(`/comic/${cId}`)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="animate-spin h-8 w-8 rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!chId || totalPages === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-black text-white">
        <p className="text-lg">无法加载章节</p>
        <button
          onClick={handleClose}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm hover:bg-primary-hover"
        >
          返回
        </button>
      </div>
    )
  }

  return (
    <Reader
      comicId={cId}
      chapterId={chId}
      totalPages={totalPages}
      onClose={handleClose}
    />
  )
}
