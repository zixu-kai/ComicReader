import { FastifyInstance } from 'fastify'
import { bookRatingService } from '@/services/bookRatingService.js'

export async function bookRatingRoutes(app: FastifyInstance) {
  app.get('/api/books/:bookId/rating', async (request) => {
    const { bookId } = request.params as { bookId: string }
    return bookRatingService.getRating(parseInt(bookId))
  })

  app.put('/api/books/:bookId/rating', async (request) => {
    const { bookId } = request.params as { bookId: string }
    const data = request.body as any
    return bookRatingService.setRating(parseInt(bookId), data.score, data.readingStatus, data.notes)
  })

  app.get('/api/book-ratings/stats', async () => {
    return bookRatingService.getStats()
  })
}
