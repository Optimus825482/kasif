/**
 * Reactivate soft-deleted locations as inactive (isActive = false).
 * These are locations in DB but NOT in source documents (BALK.TXT / KTB).
 * They will be visible in admin panel but hidden from public site.
 */
import "dotenv/config";
import pg from "pg";
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  // Restore soft-deleted locations: clear deletedAt, set isActive = false
  const result = await pool.query(
    `UPDATE "Location" 
     SET "deletedAt" = NULL, "isActive" = false, "updatedAt" = NOW() 
     WHERE "deletedAt" IS NOT NULL`,
  );

  console.log(
    `Restored ${result.rowCount} locations as INACTIVE (isActive = false)`,
  );

  // Verify counts
  const active = await pool.query(
    `SELECT COUNT(*) as count FROM "Location" WHERE "deletedAt" IS NULL AND "isActive" = true`,
  );
  const inactive = await pool.query(
    `SELECT COUNT(*) as count FROM "Location" WHERE "deletedAt" IS NULL AND "isActive" = false`,
  );
  const total = await pool.query(
    `SELECT COUNT(*) as count FROM "Location" WHERE "deletedAt" IS NULL`,
  );

  console.log(`\n--- SUMMARY ---`);
  console.log(`Active locations: ${active.rows[0].count}`);
  console.log(`Inactive locations: ${inactive.rows[0].count}`);
  console.log(`Total locations: ${total.rows[0].count}`);

  // List inactive ones
  const inactiveList = await pool.query(
    `SELECT name FROM "Location" WHERE "isActive" = false AND "deletedAt" IS NULL ORDER BY name`,
  );
  console.log(`\nInactive locations:`);
  inactiveList.rows.forEach((r, i) => console.log(`  ${i + 1}. ${r.name}`));

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
