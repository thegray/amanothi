#!/bin/sh
set -e

echo "=== Startup validation ==="

missing=""
for var in DATABASE_URL DIRECT_URL; do
  eval "val=\$$var"
  if [ -z "$val" ]; then
    missing="$missing $var"
  fi
done

if [ -n "$missing" ]; then
  echo "ERROR: Missing required environment variables:$missing" >&2
  exit 1
fi

if [ ! -f "server/entry.bun.js" ]; then
  echo "ERROR: server/entry.bun.js not found. Build may have failed." >&2
  exit 1
fi

echo "=== Running database setup ==="
# Prisma CLI needs a direct (non-pooled) connection for schema changes
# Override DATABASE_URL with DIRECT_URL only for these commands
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  echo "Running database migrations..."
  DATABASE_URL="$DIRECT_URL" bun prisma migrate deploy || { echo "ERROR: Migration failed" >&2; exit 1; }
else
  echo "No migrations found. Pushing schema directly..."
  DATABASE_URL="$DIRECT_URL" bun prisma db push || { echo "ERROR: db push failed" >&2; exit 1; }
fi

echo "=== Starting server ==="
exec bun server/entry.bun.js
