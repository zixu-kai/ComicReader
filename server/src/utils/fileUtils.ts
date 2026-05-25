import path from 'path'

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.avif'])
const ARCHIVE_EXTENSIONS = new Set(['.cbz', '.cbr', '.zip', '.rar'])

export function isImageFile(filename: string): boolean {
  return IMAGE_EXTENSIONS.has(path.extname(filename).toLowerCase())
}

export function isArchiveFile(filename: string): boolean {
  return ARCHIVE_EXTENSIONS.has(path.extname(filename).toLowerCase())
}

export function isComicArchive(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase()
  return ['.cbz', '.cbr', '.zip', '.rar'].includes(ext)
}

export function getFileType(filename: string): 'cbz' | 'cbr' | 'zip' | 'rar' | 'folder' | 'pdf' {
  const ext = path.extname(filename).toLowerCase()
  switch (ext) {
    case '.cbz': return 'cbz'
    case '.cbr': return 'cbr'
    case '.zip': return 'zip'
    case '.rar': return 'rar'
    case '.pdf': return 'pdf'
    default: return 'folder'
  }
}

export function naturalSort(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
}

const ALL_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.avif',
  '.cbz', '.cbr', '.zip', '.rar',
  '.epub', '.pdf', '.txt', '.mobi', '.azw3',
])

export function sanitizeTitle(filename: string): string {
  let name = path.basename(filename)
  const ext = path.extname(name)
  if (ext && ALL_EXTENSIONS.has(ext.toLowerCase())) {
    name = path.basename(name, ext)
  }
  name = name.replace(/[_]/g, ' ')
  name = name.replace(/\s+/g, ' ').trim()
  name = name.replace(/^\[.*?\]\s*/, '')
  return name || filename
}

export function cleanSeriesTitle(title: string): string {
  let cleaned = title.replace(/\s*\[.*?\]\s*/g, ' ').trim()
  cleaned = cleaned.replace(/\s+/g, ' ')
  const parts = cleaned.split(/\s+/)
  const uniqueParts: string[] = []
  for (const part of parts) {
    if (!uniqueParts.includes(part)) {
      uniqueParts.push(part)
    }
  }
  cleaned = uniqueParts.join(' ')
  return cleaned || title
}

const BOOK_EXTENSIONS = new Set(['.epub', '.pdf', '.txt', '.mobi', '.azw3'])

export function isBookFile(filename: string): boolean {
  return BOOK_EXTENSIONS.has(path.extname(filename).toLowerCase())
}

export function getBookFormat(filename: string): 'epub' | 'pdf' | 'txt' | 'mobi' | 'azw3' {
  const ext = path.extname(filename).toLowerCase().replace('.', '')
  return (['epub', 'pdf', 'txt', 'mobi', 'azw3'].includes(ext) ? ext : 'pdf') as 'epub' | 'pdf' | 'txt' | 'mobi' | 'azw3'
}
