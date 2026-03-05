#!/bin/sh
set -e

# Extract DB host/user from DATABASE_URL for pg_isready
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's|.*@\([^:]*\):.*|\1|p')
DB_USER=$(echo "$DATABASE_URL" | sed -n 's|.*://\([^:]*\):.*|\1|p')
DB_HOST="${DB_HOST:-db}"
DB_USER="${DB_USER:-kasif}"

echo "==> Waiting for PostgreSQL at $DB_HOST..."

RETRIES=30
until pg_isready -h "$DB_HOST" -p 5432 -U "$DB_USER" -q 2>/dev/null; do
  RETRIES=$((RETRIES - 1))
  if [ "$RETRIES" -le 0 ]; then
    echo "ERROR: PostgreSQL not reachable after 30 seconds"
    exit 1
  fi
  echo "  Waiting for DB... ($RETRIES attempts left)"
  sleep 1
done

echo "==> PostgreSQL is ready."

# --- Run migrations ---
echo "==> Running database migrations..."
npx prisma migrate deploy

# --- Seed if empty ---
CATEGORY_COUNT=$(node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT COUNT(*) FROM \"Category\"')
  .then(r => { console.log(r.rows[0].count); pool.end(); })
  .catch(() => { console.log('0'); pool.end(); });
")

if [ "$CATEGORY_COUNT" = "0" ]; then
  echo "==> Database empty, running seed..."
  npx tsx prisma/seed.ts
  echo "==> Seed completed."
else
  echo "==> Database has $CATEGORY_COUNT categories, skipping seed."
fi

# --- Start Next.js ---
echo "==> Starting Next.js application..."
exec node server.js
