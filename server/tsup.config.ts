import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node20',
  outDir: 'dist',
  clean: true,
  splitting: false,
  sourcemap: true,
  dts: false,
  bundle: true,
  external: ['sharp', '@libsql/client', 'fastify', '@fastify/cors', '@fastify/static', '@fastify/multipart', 'drizzle-orm', 'jsonwebtoken', 'dotenv', 'archiver', 'adm-zip', 'fast-xml-parser'],
})
