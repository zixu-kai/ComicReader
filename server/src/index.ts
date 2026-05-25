import Fastify from 'fastify'
import cors from '@fastify/cors'
import staticPlugin from '@fastify/static'
import multipart from '@fastify/multipart'
import { authHook } from '@/middleware/auth.js'
import { comicRoutes } from '@/routes/comics.js'
import { chapterRoutes } from '@/routes/chapters.js'
import { categoryRoutes } from '@/routes/categories.js'
import { tagRoutes } from '@/routes/tags.js'
import { ratingRoutes } from '@/routes/ratings.js'
import { progressRoutes } from '@/routes/progress.js'
import { systemRoutes } from '@/routes/system.js'
import { bookRoutes } from '@/routes/books.js'
import { bookRatingRoutes } from '@/routes/bookRatings.js'
import { bookmarkRoutes } from '@/routes/bookmarks.js'
import { annotationRoutes } from '@/routes/annotations.js'
import config from '@/config/index.js'
import { db, schema } from '@/db/index.js'
import { runMigrations } from '@/db/migrate.js'
import { sql } from 'drizzle-orm'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const staticDir = fs.existsSync(path.resolve(__dirname, './static'))
  ? path.resolve(__dirname, './static')
  : path.resolve(__dirname, '../static')

const app = Fastify({ logger: { level: 'warn' }, bodyLimit: 50 * 1024 * 1024 })

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err)
})

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason)
})

try {
  await runMigrations()
} catch (err) {
  console.error('Migration error (non-fatal):', err)
}

await app.register(cors, { origin: true })

app.addHook('onRequest', authHook)

await app.register(comicRoutes)
await app.register(chapterRoutes)
await app.register(categoryRoutes)
await app.register(tagRoutes)
await app.register(ratingRoutes)
await app.register(progressRoutes)
await app.register(systemRoutes)
await app.register(bookRoutes)
await app.register(bookRatingRoutes)
await app.register(bookmarkRoutes)
await app.register(annotationRoutes)

if (!fs.existsSync(config.coversDir)) {
  fs.mkdirSync(config.coversDir, { recursive: true })
}
await app.register(staticPlugin, {
  root: config.coversDir,
  prefix: '/covers/',
  decorateReply: false,
})

if (fs.existsSync(staticDir)) {
  await app.register(staticPlugin, {
    root: staticDir,
    prefix: '/',
    decorateReply: false,
  })

  app.setNotFoundHandler((request, reply) => {
    if (request.url.startsWith('/api')) {
      reply.code(404).send({ error: 'Not found' })
      return
    }
    const indexPath = path.join(staticDir, 'index.html')
    reply.type('text/html; charset=utf-8').send(fs.readFileSync(indexPath))
  })
}

app.get('/api/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

try {
  await app.listen({ port: config.port, host: config.host })
  console.log('')
  console.log('  OwnShelf server running')
  console.log(`  URL:    http://localhost:${config.port}`)
  console.log(`  Comics: ${config.comicsDir}`)
  console.log(`  Books:  ${config.booksDir}`)
  console.log(`  DB:     ${config.dbPath}`)
  console.log('')
} catch (err) {
  console.error('Failed to start server:', err)
  process.exit(1)
}
