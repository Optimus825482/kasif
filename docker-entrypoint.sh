#!/bin/sh
set -e

DB_USER="kasif"
DB_PASS="kasif2026secure"
DB_NAME="smartcity"

export DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}"

# --- Start PostgreSQL ---
echo "==> Initializing PostgreSQL..."

if [ ! -f /var/lib/postgresql/data/PG_VERSION ]; then
  echo "==> First run: creating database cluster..."
  su-exec postgres initdb -D /var/lib/postgresql/data --encoding=UTF8 --locale=C
  
  # Allow local connections
  echo "host all all 0.0.0.0/0 md5" >> /var/lib/postgresql/data/pg_hba.conf
  echo "local all all trust" >> /var/lib/postgresql/data/pg_hba.conf
  sed -i "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/" /var/lib/postgresql/data/postgresql.conf
fi

echo "==> Starting PostgreSQL..."
su-exec postgres pg_ctl -D /var/lib/postgresql/data -l /var/lib/postgresql/data/logfile start -w

# Create user and database if first run
su-exec postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" | grep -q 1 || \
  su-exec postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';"

su-exec postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1 || \
  su-exec postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"

su-exec postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"

echo "==> PostgreSQL ready."

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
