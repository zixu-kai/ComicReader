FROM node:22-alpine AS web-builder
RUN corepack disable && npm install -g pnpm@11.1.2
WORKDIR /app
COPY .npmrc package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY web/package.json ./web/
COPY shared/package.json ./shared/
COPY server/package.json ./server/
RUN pnpm --version && rm pnpm-lock.yaml && pnpm install --no-frozen-lockfile --reporter append-only 2>&1
COPY web/ ./web/
COPY shared/ ./shared/
RUN pnpm --filter web build

FROM node:22-alpine AS server-builder
RUN corepack disable && npm install -g pnpm@11.1.2
WORKDIR /app
COPY .npmrc package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY server/package.json ./server/
COPY shared/package.json ./shared/
COPY web/package.json ./web/
RUN pnpm --version && rm pnpm-lock.yaml && pnpm install --no-frozen-lockfile --reporter append-only 2>&1
COPY server/ ./server/
COPY shared/ ./shared/
RUN pnpm --filter server build

FROM node:22-alpine AS runtime
RUN apk add --no-cache vips vips-dev python3 make g++ su-exec
RUN corepack disable && npm install -g pnpm@11.1.2
WORKDIR /app
COPY .npmrc package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY server/package.json ./server/
COPY shared/package.json ./shared/
COPY web/package.json ./web/
RUN pnpm --version && rm pnpm-lock.yaml && pnpm install --no-frozen-lockfile --prod --reporter append-only 2>&1
RUN npm rebuild sharp @libsql/client
RUN apk del vips-dev python3 make g++
COPY --from=server-builder /app/server/dist ./server/dist
COPY --from=server-builder /app/server/drizzle ./server/drizzle
COPY --from=web-builder /app/server/static ./server/static
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh && mkdir -p /comics /books /app/data

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=7788
ENV COMICS_DIR=/comics
ENV BOOKS_DIR=/books
ENV DB_PATH=/app/data/ownshelf.db
ENV COVERS_DIR=/app/data/covers
ENV JWT_SECRET=change-me-in-production
ENV PUID=
ENV PGID=

EXPOSE 7788
VOLUME ["/comics", "/books", "/app/data"]
ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "server/dist/index.js"]