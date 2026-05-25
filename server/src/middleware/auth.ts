import { FastifyRequest, FastifyReply } from 'fastify'
import jwt from 'jsonwebtoken'
import config from '@/config/index.js'

export interface AuthPayload {
  userId: string
}

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
  const authHeader = request.headers.authorization
  if (!authHeader) return

  const token = authHeader.replace(/^Bearer\s+/i, '')
  const payload = verifyToken(token)
  if (payload) {
    request.user = payload
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthPayload | null
  }
}
