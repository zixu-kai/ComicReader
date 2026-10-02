import fs from 'fs'
import { createRequire } from 'module'
import { createExtractorFromData } from 'node-unrar-js'
import { isImageFile, naturalSort } from '@/utils/index.js'

const require = createRequire(import.meta.url)

let wasmBinaryCache: Buffer | null = null

function getWasmBinary(): Buffer {
  if (!wasmBinaryCache) {
    const wasmPath = require.resolve('node-unrar-js/dist/js/unrar.wasm')
    wasmBinaryCache = fs.readFileSync(wasmPath)
  }
  return wasmBinaryCache
}

/**
 * 列出 RAR/CBR 归档内所有图片文件的条目名（按自然排序）
 */
export async function listRarImages(archivePath: string): Promise<string[]> {
  try {
    const extractor = await createExtractorFromData({
      data: fs.readFileSync(archivePath),
      wasmBinary: getWasmBinary(),
    })
    const { fileHeaders } = extractor.getFileList()
    const names: string[] = []
    for (const header of fileHeaders) {
      if (!header.flags.directory && isImageFile(header.name)) {
        names.push(header.name)
      }
    }
    return names.sort(naturalSort)
  } catch {
    return []
  }
}

/**
 * 读取 RAR/CBR 归档内指定条目的图片字节（内存解压，不落盘）
 */
export async function readRarImage(archivePath: string, entryName: string): Promise<Buffer | null> {
  try {
    const extractor = await createExtractorFromData({
      data: fs.readFileSync(archivePath),
      wasmBinary: getWasmBinary(),
    })
    const { files } = extractor.extract({ files: [entryName] })
    for (const file of files) {
      if (!file.fileHeader.flags.directory && file.extraction) {
        return Buffer.from(file.extraction as Uint8Array)
      }
    }
    return null
  } catch {
    return null
  }
}
