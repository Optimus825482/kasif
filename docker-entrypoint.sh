#!/bin/sh
set -e

echo "==> Running database migrations..."
npx prisma migrate deploy

# Only seed if database is empty (no locations exist)
LOCATION_COUNT=$(node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT COUNT(*) FROM \"Location\"')
  .then(r => { console.log(r.rows[0].count); pool.end(); })
  .catch(() => { console.log('0'); pool.end(); });
")

if [ "$LOCATION_COUNT" = "0" ]; then
  echo "==> Database empty, running seed..."
  node prisma/seed.mjs
  echo "==> Seed completed"
else
  echo "==> Database has $LOCATION_COUNT locations, skipping seed"
fi

echo "==> Starting application..."
exec node server.js
