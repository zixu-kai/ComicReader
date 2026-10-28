import { FastifyInstance } from 'fastify'
import { settingsService, metadataWriteProgress } from '@/services/settingsService.js'
import type { AppSettings } from '@/types/index.js'

export async function settingsRoutes(app: FastifyInstance) {
  app.get('/api/settings', async () => {
    return settingsService.getSettings()
  })

  app.put('/api/settings', async (request) => {
    const body = (request.body || {}) as Partial<AppSettings>
    return settingsService.updateSettings(body)
  })

  // 手动触发：把数据库元数据写回所有 CBZ
  app.post('/api/settings/write-metadata', async () => {
    if (metadataWriteProgress.running) {
      return { status: 'running' }
    }
    settingsService.writeAllMetadataToCbz().catch((err) => {
      console.error('[Metadata] 写入失败:', err)
    })
    return { status: 'started' }
  })

  app.get('/api/settings/write-metadata/status', async () => {
    return { ...metadataWriteProgress }
  })
}
