#!/bin/sh
set -e

if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  echo "Running database migrations..."
  bun prisma migrate deploy
else
  echo "No migrations found. Pushing schema directly..."
  bun prisma db push
fi

echo "Starting server..."
exec bun server/entry.bun.js
