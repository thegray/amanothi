# Stage 1: Build the application using Bun
FROM oven/bun:1.3.14 AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

# Stage 2: Serve the application using Bun
FROM oven/bun:1.3.14
WORKDIR /app

# Copy all dependencies (prisma CLI needed for migrations in entrypoint)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy build artifacts and prisma schema
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8080
ENV PORT=8080
ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD ["bun", "-e", "fetch('http://localhost:8080/health/').then(r => {if(!r.ok) process.exit(1)}).catch(() => process.exit(1))"]

ENTRYPOINT ["/entrypoint.sh"]