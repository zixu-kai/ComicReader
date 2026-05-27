#!/bin/sh
set -e

DATA_DIR="${DATA_DIR:-/app/data}"
DB_PATH="${DB_PATH:-$DATA_DIR/ownshelf.db}"
DB_DIR="$(dirname "$DB_PATH")"
COVERS_DIR="${COVERS_DIR:-$DATA_DIR/covers}"

mkdir -p "$DATA_DIR" "$DB_DIR" "$COVERS_DIR"
touch "$DB_PATH" 2>/dev/null || true

if [ -n "$PUID" ] && [ -n "$PGID" ]; then
    if ! getent group "$PGID" >/dev/null 2>&1; then
        groupadd -g "$PGID" appgroup 2>/dev/null || true
    fi
    if ! getent passwd "$PUID" >/dev/null 2>&1; then
        useradd -u "$PUID" -g "$PGID" -M -s /usr/sbin/nologin appuser 2>/dev/null || true
    fi
    chown -R "$PUID:$PGID" /app "$DATA_DIR" "$DB_DIR" "$COVERS_DIR" 2>/dev/null || true
    exec gosu "$PUID:$PGID" "$@"
else
    exec "$@"
fi
