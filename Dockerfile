FROM node:22-bookworm-slim AS web-builder
WORKDIR /app
COPY package.json ./
COPY web/package.json ./web/
COPY shared/package.json ./shared/
COPY server/package.json ./server/
RUN npm install
COPY web/ ./web/
COPY shared/ ./shared/
RUN npm run build -w web

FROM node:22-bookworm-slim AS server-builder
WORKDIR /app
COPY package.json ./
COPY server/package.json ./server/
COPY shared/package.json ./shared/
COPY web/package.json ./web/
RUN npm install
COPY server/ ./server/
COPY shared/ ./shared/
RUN npm run build -w server

FROM node:22-bookworm-slim AS runtime
WORKDIR /app
COPY package.json ./
COPY server/package.json ./server/
COPY shared/package.json ./shared/
RUN npm install --omit=dev
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