import { FastifyInstance } from 'fastify'
import { progressService } from '@/services/progressService.js'

export async function progressRoutes(app: FastifyInstance) {
  app.get('/api/comics/:comicId/progress', async (request) => {
    const { comicId } = request.params as { comicId: string }
    return progressService.getProgress(parseInt(comicId))
  })

  app.put('/api/comics/:comicId/progress', async (request) => {
    const { comicId } = request.params as { comicId: string }
    const { chapterId, currentPage, totalPages } = request.body as {
      chapterId: number
      currentPage: number
      totalPages: number
    }
    return progressService.updateProgress(parseInt(comicId), chapterId, currentPage, totalPages)
  })

  app.post('/api/comics/:comicId/complete', async (request) => {
    const { comicId } = request.params as { comicId: string }
    await progressService.markCompleted(parseInt(comicId))
    return { success: true }
  })

  app.get('/api/progress/continue', async () => {
    return progressService.getContinueReading()
  })
}
