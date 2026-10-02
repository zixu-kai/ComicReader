import { db } from './index.js'
import { sql } from 'drizzle-orm'

const migrationStatements = [
`CREATE TABLE IF NOT EXISTS annotations (
  id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  target_type text NOT NULL,
  target_id integer NOT NULL,
  page integer,
  position text,
  content text NOT NULL,
  note text,
  color text DEFAULT 'yellow',
  created_at text NOT NULL,
  updated_at text NOT NULL
)`,
`CREATE INDEX IF NOT EXISTS idx_annotations_target ON annotations (target_type, target_id)`,

`CREATE TABLE IF NOT EXISTS bookmark_comics (
  bookmark_id integer NOT NULL,
  comic_id integer NOT NULL,
  FOREIGN KEY (bookmark_id) REFERENCES bookmarks(id) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (comic_id) REFERENCES comics(id) ON UPDATE no action ON DELETE cascade
)`,
`CREATE INDEX IF NOT EXISTS idx_bookmark_comics_bookmark ON bookmark_comics (bookmark_id)`,
`CREATE UNIQUE INDEX IF NOT EXISTS idx_bookmark_comics_unique ON bookmark_comics (bookmark_id, comic_id)`,

`CREATE TABLE IF NOT EXISTS bookmarks (
  id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  name text NOT NULL,
  "order" integer DEFAULT 0 NOT NULL,
  created_at text NOT NULL
)`,

`CREATE TABLE IF NOT EXISTS categories (
  id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  name text NOT NULL,
  description text,
  "order" integer DEFAULT 0 NOT NULL,
  parent_id integer,
  created_at text NOT NULL,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON UPDATE no action ON DELETE set null
)`,
`CREATE UNIQUE INDEX IF NOT EXISTS categories_name_unique ON categories (name)`,
`CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories (parent_id)`,

`CREATE TABLE IF NOT EXISTS chapters (
  id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  comic_id integer NOT NULL,
  volume integer,
  chapter_number integer DEFAULT 1 NOT NULL,
  title text,
  page_count integer DEFAULT 0 NOT NULL,
  file_path text NOT NULL,
  sort_order integer DEFAULT 0 NOT NULL,
  created_at text NOT NULL,
  updated_at text NOT NULL,
  FOREIGN KEY (comic_id) REFERENCES comics(id) ON UPDATE no action ON DELETE cascade
)`,
`CREATE INDEX IF NOT EXISTS idx_chapters_comic ON chapters (comic_id)`,
`CREATE INDEX IF NOT EXISTS idx_chapters_sort ON chapters (comic_id, sort_order)`,

`CREATE TABLE IF NOT EXISTS comic_categories (
  comic_id integer NOT NULL,
  category_id integer NOT NULL,
  FOREIGN KEY (comic_id) REFERENCES comics(id) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON UPDATE no action ON DELETE cascade
)`,
`CREATE INDEX IF NOT EXISTS idx_comic_categories_comic ON comic_categories (comic_id)`,
`CREATE INDEX IF NOT EXISTS idx_comic_categories_category ON comic_categories (category_id)`,

`CREATE TABLE IF NOT EXISTS comic_tags (
  comic_id integer NOT NULL,
  tag_id integer NOT NULL,
  FOREIGN KEY (comic_id) REFERENCES comics(id) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON UPDATE no action ON DELETE cascade
)`,
`CREATE INDEX IF NOT EXISTS idx_comic_tags_comic ON comic_tags (comic_id)`,
`CREATE INDEX IF NOT EXISTS idx_comic_tags_tag ON comic_tags (tag_id)`,

`CREATE TABLE IF NOT EXISTS comics (
  id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  title text NOT NULL,
  title_sort text NOT NULL,
  author text,
  artist text,
  description text,
  status text DEFAULT 'unknown' NOT NULL,
  year integer,
  language text,
  path text NOT NULL,
  file_type text NOT NULL,
  page_count integer DEFAULT 0 NOT NULL,
  cover_path text,
  file_size integer DEFAULT 0 NOT NULL,
  last_read_at text,
  created_at text NOT NULL,
  updated_at text NOT NULL
)`,
`CREATE UNIQUE INDEX IF NOT EXISTS comics_path_unique ON comics (path)`,
`CREATE INDEX IF NOT EXISTS idx_comics_title ON comics (title_sort)`,
`CREATE INDEX IF NOT EXISTS idx_comics_author ON comics (author)`,
`CREATE INDEX IF NOT EXISTS idx_comics_status ON comics (status)`,
`CREATE INDEX IF NOT EXISTS idx_comics_created ON comics (created_at)`,

`CREATE TABLE IF NOT EXISTS ratings (
  id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  comic_id integer NOT NULL,
  score integer DEFAULT 0 NOT NULL,
  reading_status text DEFAULT 'unread' NOT NULL,
  notes text,
  created_at text NOT NULL,
  updated_at text NOT NULL,
  FOREIGN KEY (comic_id) REFERENCES comics(id) ON UPDATE no action ON DELETE cascade
)`,
`CREATE UNIQUE INDEX IF NOT EXISTS ratings_comic_id_unique ON ratings (comic_id)`,
`CREATE INDEX IF NOT EXISTS idx_ratings_comic ON ratings (comic_id)`,
`CREATE INDEX IF NOT EXISTS idx_ratings_status ON ratings (reading_status)`,

`CREATE TABLE IF NOT EXISTS reading_progress (
  id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  comic_id integer NOT NULL,
  chapter_id integer NOT NULL,
  current_page integer DEFAULT 0 NOT NULL,
  total_pages integer DEFAULT 0 NOT NULL,
  is_completed integer DEFAULT false NOT NULL,
  last_read_at text NOT NULL,
  created_at text NOT NULL,
  updated_at text NOT NULL,
  FOREIGN KEY (comic_id) REFERENCES comics(id) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON UPDATE no action ON DELETE cascade
)`,
`CREATE INDEX IF NOT EXISTS idx_progress_comic ON reading_progress (comic_id)`,
`CREATE INDEX IF NOT EXISTS idx_progress_last_read ON reading_progress (last_read_at)`,

`CREATE TABLE IF NOT EXISTS tags (
  id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  name text NOT NULL,
  created_at text NOT NULL
)`,
`CREATE UNIQUE INDEX IF NOT EXISTS tags_name_unique ON tags (name)`,

`ALTER TABLE annotations ADD COLUMN start_offset integer`,
`ALTER TABLE annotations ADD COLUMN end_offset integer`,

`ALTER TABLE categories ADD COLUMN hidden integer NOT NULL DEFAULT 0`,

`ALTER TABLE tags ADD COLUMN "order" integer NOT NULL DEFAULT 0`,
`UPDATE tags SET "order" = id WHERE "order" = 0`,
]

export async function runMigrations() {
  console.log('Running database migrations...')
  try {
    for (const stmt of migrationStatements) {
      try {
        await db.run(sql.raw(stmt))
      } catch (err: any) {
        // DrizzleQueryError 把真实原因放在 cause 里，需两层都检查
        const msg = `${err?.message || ''} ${err?.cause?.message || ''}`
        if (msg.includes('duplicate column name') || msg.includes('already exists')) {
          continue
        }
        throw err
      }
    }
    console.log('Database migrations completed.')
  } catch (err) {
    console.error('Migration error:', err)
    throw err
  }
}