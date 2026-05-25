import { FastifyInstance } from 'fastify'
import { categoryService } from '@/services/categoryService.js'

export async function categoryRoutes(app: FastifyInstance) {
  app.get('/api/categories', async (request) => {
    const { includeHidden } = request.query as { includeHidden?: string }
    return categoryService.getCategories(includeHidden === 'true')
  })

  app.post('/api/categories', async (request) => {
    const data = request.body as { name: string; description?: string; parentId?: number }
    return categoryService.createCategory(data)
  })

  app.put('/api/categories/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const data = request.body as { name?: string; description?: string; order?: number; parentId?: number }
    const result = await categoryService.updateCategory(parseInt(id), data)
    if (!result) {
      reply.code(404).send({ error: 'Category not found' })
      return
    }
    return result
  })

  app.put('/api/categories/:id/toggle-hidden', async (request, reply) => {
    const { id } = request.params as { id: string }
    const result = await categoryService.toggleHidden(parseInt(id))
    if (!result) {
      reply.code(404).send({ error: 'Category not found' })
      return
    }
    return result
  })

  app.delete('/api/categories/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    await categoryService.deleteCategory(parseInt(id))
    reply.code(204).send()
  })
}
