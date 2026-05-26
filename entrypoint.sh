#!/bin/sh
set -e

if [ -n "$PUID" ] && [ -n "$PGID" ]; then
    groupadd -g "$PGID" appgroup 2>/dev/null || true
    useradd -m -u "$PUID" -g appgroup -s /bin/sh appuser 2>/dev/null || true
    mkdir -p /app/data
    chown -R "$PUID:$PGID" /app/data 2>/dev/null || true
    exec setpriv --reuid="$PUID" --regid="$PGID" --init-groups "$@"
else
    exec "$@"
fi