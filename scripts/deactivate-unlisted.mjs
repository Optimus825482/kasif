// Deactivate locations NOT found in either BALK.TXT or KTB_Dogal_Guzellikler.md
// These locations stay in DB but won't show in the app (isActive = false)
import "dotenv/config";
import pg from "pg";
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Locations in DB but NOT mentioned in either source document
const idsToDeactivate = [
  "cmmedd5hp432b44edaf8fc625", // AliBey (Çınarlı) Camisi (Ayvalık)
  "cmmeb7hra001kwggsf3hiu55n", // Balıkesir Ulu Camii (Zağnos Paşa Camii Yanı)
  "cmmedd5hsffb3cb0be76cb1b4", // Biberli Cami (Ayvalık)
  "cmmedd5hvb2d074b95cb45edf", // Hacı Bayram Camisi (Ayvalık)
  "cmmedd5hub36ee3c94427fdbd", // Hamidiye Camisi (Ayvalık)
  "cmmedd5hw8a69645438d07ecd", // Kadı Camii (Ayvalık)
  "cmmedd5hn08948c8133dc7928", // Saatli Kilise Camisi (Ayvalık)
  "cmmeb7hta002ywggsq91aqpb5", // Su Çıktı (Kepsut)
  "cmmedd5hrd04487984fdf1f0f", // Yeni Cami (Ayvalık)
];

async function main() {
  const placeholders = idsToDeactivate.map((_, i) => `$${i + 1}`).join(", ");
  const sql = `UPDATE "Location" SET "isActive" = false, "updatedAt" = NOW() WHERE id IN (${placeholders}) AND "isActive" = true AND "deletedAt" IS NULL`;
  const result = await pool.query(sql, idsToDeactivate);
  console.log(`Deactivated ${result.rowCount} locations (isActive = false)`);

  // Verify counts
  const active = await pool.query(
    `SELECT COUNT(*) as cnt FROM "Location" WHERE "deletedAt" IS NULL AND "isActive" = true`,
  );
  const inactive = await pool.query(
    `SELECT COUNT(*) as cnt FROM "Location" WHERE "deletedAt" IS NULL AND "isActive" = false`,
  );
  const deleted = await pool.query(
    `SELECT COUNT(*) as cnt FROM "Location" WHERE "deletedAt" IS NOT NULL`,
  );
  console.log(
    `Active: ${active.rows[0].cnt}, Inactive: ${inactive.rows[0].cnt}, Soft-deleted: ${deleted.rows[0].cnt}`,
  );

  // List deactivated
  const deactivated = await pool.query(
    `SELECT name FROM "Location" WHERE "isActive" = false AND "deletedAt" IS NULL ORDER BY name`,
  );
  console.log("\nDeactivated locations:");
  deactivated.rows.forEach((r) => console.log(`  - ${r.name}`));

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
