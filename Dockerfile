FROM node:20-alpine AS base

# --- Dependencies ---
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- Builder ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# --- Runner (Node.js + PostgreSQL in one container) ---
FROM base AS runner
WORKDIR /app

# Install PostgreSQL
RUN apk add --no-cache postgresql postgresql-client libc6-compat su-exec

# Setup PostgreSQL data directory
RUN mkdir -p /var/lib/postgresql/data /run/postgresql /var/log/postgresql && \
    chown -R postgres:postgres /var/lib/postgresql /run/postgresql /var/log/postgresql

ENV NODE_ENV=production
ENV PORT=3011
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_URL="postgresql://kasif:kasif2026@127.0.0.1:5432/smartcity"
ENV JWT_SECRET="kasif-jwt-secret-change-in-production"
ENV NEXT_PUBLIC_APP_URL="https://kasif.erkanerdem.net"
ENV NEXT_PUBLIC_MAP_CENTER_LAT="39.6484"
ENV NEXT_PUBLIC_MAP_CENTER_LNG="27.8826"
ENV NEXT_PUBLIC_MAP_ZOOM="10"

# Copy full node_modules for prisma CLI + seed runtime
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy Prisma files for migration & seed
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/generated ./generated

# Copy public assets
COPY --from=builder /app/public ./public

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy entrypoint
COPY --from=builder /app/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3011

# Volume for persistent PostgreSQL data
VOLUME ["/var/lib/postgresql/data"]

# Run as root (needed to start PostgreSQL, then Next.js runs)
ENTRYPOINT ["./docker-entrypoint.sh"]
