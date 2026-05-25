import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'shared': path.resolve(__dirname, '../shared/types/index.ts'),
    },
  },
  define: mode === 'github' ? {
    __SHOW_DONATE__: JSON.stringify(true),
  } : mode === 'nodonate' ? {
    __SHOW_DONATE__: JSON.stringify(false),
  } : {
    __SHOW_DONATE__: JSON.stringify(true),
  },
  build: {
    outDir: mode === 'github'
      ? path.resolve(__dirname, '../release/github-static')
      : mode === 'nodonate'
        ? path.resolve(__dirname, '../release/nodonate-static')
        : path.resolve(__dirname, '../server/static'),
    emptyOutDir: true,
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:7788',
        changeOrigin: true,
      },
    },
  },
}))
