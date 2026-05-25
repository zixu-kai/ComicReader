FROM node:22-alpine AS web-builder
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories
RUN corepack enable
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml .npmrc package.json ./
COPY web/package.json ./web/
COPY shared/package.json ./shared/
RUN pnpm install --no-frozen-lockfile
COPY web/ ./web/
COPY shared/ ./shared/
RUN pnpm --filter web build

FROM node:22-alpine AS server-builder
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories
RUN corepack enable
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml .npmrc package.json ./
COPY server/package.json ./server/
COPY shared/package.json ./shared/
RUN pnpm install --no-frozen-lockfile
COPY server/ ./server/
COPY shared/ ./shared/
RUN pnpm --filter server build

FROM node:22-alpine AS runtime
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories
RUN apk add --no-cache vips vips-dev python3 make g++ su-exec
RUN corepack enable
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml .npmrc package.json ./
COPY server/package.json ./server/
COPY shared/package.json ./shared/
RUN pnpm install --no-frozen-lockfile --prod
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