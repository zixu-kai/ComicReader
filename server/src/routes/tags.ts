import { FastifyInstance } from 'fastify'
import { tagService } from '@/services/tagService.js'

export async function tagRoutes(app: FastifyInstance) {
  app.get('/api/tags', async () => {
    return tagService.getTags()
  })

  app.post('/api/tags', async (request) => {
    const { name } = request.body as { name: string }
    return tagService.createTag(name)
  })

  app.put('/api/tags/:id/move', async (request, reply) => {
    const { id } = request.params as { id: string }
    const { direction } = (request.body as { direction?: string }) || {}
    if (direction !== 'up' && direction !== 'down') {
      reply.code(400).send({ error: 'direction must be up or down' })
      return
    }
    await tagService.moveTag(parseInt(id), direction)
    return { success: true }
  })

  app.post('/api/tags/batch-delete', async (request, reply) => {
    const { ids } = (request.body as { ids?: number[] }) || {}
    if (!Array.isArray(ids) || ids.length === 0) {
      reply.code(400).send({ error: 'ids array required' })
      return
    }
    const count = await tagService.deleteTags(ids.map(Number))
    return { success: true, count }
  })

  app.delete('/api/tags/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    await tagService.deleteTag(parseInt(id))
    reply.code(204).send()
  })
}
