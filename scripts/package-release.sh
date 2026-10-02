#!/bin/bash
# 打包 GitHub Release 部署包（含源码 + Dockerfile + NAS docker-compose）
# 用法: bash scripts/package-release.sh [版本号]  例如 v1.1.0
set -e

VERSION="${1:-latest}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PKG="$ROOT/release/OwnShelf-$VERSION"

echo "=== 打包 OwnShelf-$VERSION ==="
rm -rf "$PKG"
mkdir -p "$PKG/server" "$PKG/web" "$PKG/shared"

# 顶层文件
for f in package.json Dockerfile entrypoint.sh .env.example .dockerignore .npmrc README.md LICENSE; do
  [ -f "$ROOT/$f" ] && cp "$ROOT/$f" "$PKG/"
done

# 部署用 compose（build: .，绿联/群晖可直接项目部署）
cp "$ROOT/scripts/nas-docker-compose.yaml" "$PKG/docker-compose.yaml"

# 后端源码
cp "$ROOT/server/package.json" "$ROOT/server/tsconfig.json" "$ROOT/server/tsup.config.ts" "$ROOT/server/drizzle.config.ts" "$PKG/server/"
cp -r "$ROOT/server/src" "$PKG/server/src"
[ -d "$ROOT/server/drizzle" ] && cp -r "$ROOT/server/drizzle" "$PKG/server/drizzle"

# 前端源码
cp "$ROOT/web/package.json" "$ROOT/web/tsconfig.json" "$ROOT/web/vite.config.ts" "$ROOT/web/index.html" "$PKG/web/"
cp -r "$ROOT/web/src" "$PKG/web/src"
[ -d "$ROOT/web/public" ] && cp -r "$ROOT/web/public" "$PKG/web/public"

# 共享类型
cp "$ROOT/shared/package.json" "$PKG/shared/"
cp -r "$ROOT/shared/types" "$PKG/shared/types"

# 部署说明
cp "$ROOT/USAGE.md" "$PKG/部署说明.md" 2>/dev/null || true

cd "$ROOT/release"
if command -v zip >/dev/null 2>&1; then
  zip -rq "OwnShelf-$VERSION.zip" "OwnShelf-$VERSION"
  echo "已生成: release/OwnShelf-$VERSION.zip"
else
  tar -czf "OwnShelf-$VERSION.tar.gz" "OwnShelf-$VERSION"
  echo "已生成: release/OwnShelf-$VERSION.tar.gz（未安装 zip，使用 tar.gz）"
fi
