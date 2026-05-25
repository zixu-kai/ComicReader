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

  app.delete('/api/tags/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    await tagService.deleteTag(parseInt(id))
    reply.code(204).send()
  })
}
