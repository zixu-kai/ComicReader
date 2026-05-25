import { FastifyInstance } from 'fastify'
import { ratingService } from '@/services/ratingService.js'
import type { ReadingStatus } from '@/types/index.js'

export async function ratingRoutes(app: FastifyInstance) {
  app.get('/api/comics/:comicId/rating', async (request) => {
    const { comicId } = request.params as { comicId: string }
    return ratingService.getRating(parseInt(comicId))
  })

  app.put('/api/comics/:comicId/rating', async (request) => {
    const { comicId } = request.params as { comicId: string }
    const { score, readingStatus, notes } = request.body as {
      score: number
      readingStatus?: ReadingStatus
      notes?: string
    }
    return ratingService.setRating(parseInt(comicId), score, readingStatus, notes)
  })

  app.get('/api/ratings/stats', async () => {
    return ratingService.getRatingStats()
  })
}
