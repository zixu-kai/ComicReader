import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router'
import { useBookStore } from '@/stores/bookStore'
import { booksApi } from '@/services/api'
import { BookReader } from '@/components/BookReader'
import type { BookReadingProgress } from '@/types'

export default function BookReaderPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { currentBook, fetchBook } = useBookStore()
  const [progress, setProgress] = useState<BookReadingProgress | null>(null)

  const bookId = Number(id)
  const chapterParam = searchParams.get('chapter')
  const initialChapter = chapterParam ? parseInt(chapterParam, 10) : undefined

  useEffect(() => {
    if (bookId) {
      fetchBook(bookId)
      booksApi.getProgress(bookId).then(setProgress)
    }
  }, [bookId])

  const handleClose = () => {
    navigate(`/book/${bookId}`)
  }

  if (!currentBook) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: 'var(--bg-base)' }}>
        <div className="animate-spin h-8 w-8 rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <BookReader
      bookId={bookId}
      format={currentBook.format}
      initialCfi={progress?.cfi || undefined}
      initialChapter={initialChapter}
      onClose={handleClose}
    />
  )
}
