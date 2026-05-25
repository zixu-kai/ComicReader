import { useEffect, useRef, useState, useCallback } from 'react'
import { booksApi } from '@/services/api'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize, Minimize, X } from 'lucide-react'

interface PdfViewerProps {
  bookId: number
  initialPage?: number
  onClose: () => void
}

export function PdfViewer({ bookId, initialPage = 1, onClose }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(0)
  const [scale, setScale] = useState(1.5)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [rendering, setRendering] = useState(false)
  const pdfDocRef = useRef<any>(null)

  useEffect(() => {
    let mounted = true

    const loadPdf = async () => {
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

      const loadingTask = pdfjsLib.getDocument(booksApi.getFileUrl(bookId))
      const pdf = await loadingTask.promise
      pdfDocRef.current = pdf

      if (mounted) {
        setTotalPages(pdf.numPages)
        renderPage(initialPage)
      }
    }

    loadPdf()

    return () => {
      mounted = false
      pdfDocRef.current?.destroy()
    }
  }, [bookId])

  const renderPage = useCallback(async (pageNum: number) => {
    if (!pdfDocRef.current || rendering) return
    setRendering(true)

    try {
      const page = await pdfDocRef.current.getPage(pageNum)
      const canvas = canvasRef.current
      if (!canvas) return

      const context = canvas.getContext('2d')
      const viewport = page.getViewport({ scale })

      canvas.height = viewport.height
      canvas.width = viewport.width

      await page.render({
        canvasContext: context,
        viewport,
      }).promise

      setCurrentPage(pageNum)

      booksApi.updateProgress(bookId, {
        currentPage: pageNum,
        totalPages: pdfDocRef.current.numPages,
        percentage: Math.round((pageNum / pdfDocRef.current.numPages) * 10000) / 100,
      })
    } finally {
      setRendering(false)
    }
  }, [bookId, scale, rendering])

  useEffect(() => {
    if (pdfDocRef.current) {
      renderPage(currentPage)
    }
  }, [scale])

  const goPrev = useCallback(() => {
    if (currentPage > 1) {
      renderPage(currentPage - 1)
    }
  }, [currentPage, renderPage])

  const goNext = useCallback(() => {
    if (currentPage < totalPages) {
      renderPage(currentPage + 1)
    }
  }, [currentPage, totalPages, renderPage])

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      renderPage(page)
    }
  }, [totalPages, renderPage])

  const zoomIn = useCallback(() => setScale(s => Math.min(s + 0.25, 3)), [])
  const zoomOut = useCallback(() => setScale(s => Math.max(s - 0.25, 0.5)), [])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev()
      else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') goNext()
      else if (e.key === 'Escape') onClose()
      else if (e.key === 'f' || e.key === 'F') toggleFullscreen()
      else if (e.key === '+' || e.key === '=') zoomIn()
      else if (e.key === '-') zoomOut()
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [goPrev, goNext, onClose, toggleFullscreen, zoomIn, zoomOut])

  return (
    <div className="flex h-screen flex-col bg-gray-950">
      <div className="flex h-10 items-center justify-between border-b border-gray-800 bg-gray-900 px-4">
        <div className="flex items-center gap-2">
          <button onClick={zoomOut} className="rounded p-1 text-gray-400 hover:text-white">
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-xs text-gray-400">{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} className="rounded p-1 text-gray-400 hover:text-white">
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleFullscreen} className="rounded p-1 text-gray-400 hover:text-white">
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </button>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto flex justify-center p-4">
        <canvas ref={canvasRef} className="max-w-full" />
      </div>

      <div className="flex h-10 items-center justify-between border-t border-gray-800 bg-gray-900 px-4">
        <button onClick={goPrev} disabled={currentPage <= 1} className="rounded p-1 text-gray-400 hover:text-white disabled:opacity-30">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={currentPage}
            onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
            className="w-12 rounded border border-gray-700 bg-gray-800 px-1 py-0.5 text-center text-xs text-white outline-none"
            min={1}
            max={totalPages}
          />
          <span className="text-xs text-gray-500">/ {totalPages}</span>
        </div>
        <button onClick={goNext} disabled={currentPage >= totalPages} className="rounded p-1 text-gray-400 hover:text-white disabled:opacity-30">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
