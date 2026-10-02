import { FastifyRequest, FastifyReply } from 'fastify'
import jwt from 'jsonwebtoken'
import config from '@/config/index.js'

export interface AuthPayload {
  userId: string
}

const PUBLIC_API_PATHS = new Set([
  '/api/health',
  '/api/auth/login',
  '/api/auth/status',
])

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: '365d' })
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, config.jwtSecret) as AuthPayload
  } catch {
    return null
  }
}

export async function authHook(request: FastifyRequest, reply: FastifyReply) {
  const url = request.url.split('?')[0] || '/'

  if (!url.startsWith('/api')) {
    return
  }

  const authHeader = request.headers.authorization
  if (!authHeader) {
    if (config.authEnabled && !PUBLIC_API_PATHS.has(url)) {
      reply.code(401).send({ error: 'Unauthorized' })
      return
    }
    return
  }

  const token = authHeader.replace(/^Bearer\s+/i, '')
  const payload = verifyToken(token)
  if (payload) {
    request.user = payload
  } else if (config.authEnabled && !PUBLIC_API_PATHS.has(url)) {
    reply.code(401).send({ error: 'Unauthorized' })
    return
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthPayload | null
  }
}
