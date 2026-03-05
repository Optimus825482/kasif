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

# --- Runner (Next.js only — DB is a separate service) ---
FROM base AS runner
WORKDIR /app

RUN apk add --no-cache libc6-compat postgresql-client

ENV NODE_ENV=production
ENV PORT=3011
ENV HOSTNAME="0.0.0.0"

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

ENTRYPOINT ["./docker-entrypoint.sh"]
