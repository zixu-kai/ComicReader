import { FastifyInstance } from 'fastify'
import config from '@/config/index.js'
import { generateToken } from '@/middleware/auth.js'

export async function authRoutes(app: FastifyInstance) {
  app.get('/api/auth/status', async () => {
    return { enabled: config.authEnabled }
  })

  app.post('/api/auth/login', async (request, reply) => {
    const { password } = (request.body as { password?: string }) || {}
    if (!config.authEnabled) {
      reply.code(400).send({ error: 'Auth is not enabled' })
      return
    }
    if (password && password === config.authPassword) {
      return { token: generateToken('user') }
    }
    reply.code(401).send({ error: '密码错误' })
  })
}
