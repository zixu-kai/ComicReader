import dotenv from 'dotenv'
import path from 'path'

dotenv.config()

const config = {
  port: parseInt(process.env.PORT || '7788', 10),
  host: process.env.HOST || '0.0.0.0',
  comicsDir: path.resolve(process.env.COMICS_DIR || './comics'),
  booksDir: path.resolve(process.env.BOOKS_DIR || './books'),
  dbPath: path.resolve(process.env.DB_PATH || './data/ownshelf.db'),
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  scanInterval: parseInt(process.env.SCAN_INTERVAL || '300000', 10),
  coversDir: path.resolve(process.env.COVERS_DIR || './data/covers'),
  dataDir: path.resolve(process.env.DATA_DIR || './data'),
}

export default config
