import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema.js'
import config from '@/config/index.js'
import fs from 'fs'
import path from 'path'

const dataDir = path.dirname(config.dbPath)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const client = createClient({
  url: `file:${config.dbPath}`,
})

export const db = drizzle(client, { schema })
export { schema }

export type DB = typeof db
