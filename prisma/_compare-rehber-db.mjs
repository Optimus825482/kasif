// Compare BALIKESIR_TURIZM_REHBERI.md locations with DB locations
import pg from "pg";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  // 1. Get all DB locations (not soft-deleted)
  const { rows: dbRows } = await pool.query(
    `SELECT name, "isActive" FROM "Location" WHERE "deletedAt" IS NULL ORDER BY name`,
  );
  const dbNames = dbRows.map((r) => r.name);

  // 2. Read the rehber file
  const rehber = fs.readFileSync("../BALIKESIR_TURIZM_REHBERI.md", "utf-8");

  // 3. Normalize function for fuzzy matching
  const normalize = (s) =>
    s
      .toLowerCase()
      .replace(/[''"""\(\)]/g, "")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ç/g, "c")
      .replace(/ğ/g, "g")
      .replace(/â/g, "a")
      .replace(/î/g, "i")
      .replace(/[—–\-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  // 4. Check each DB location: is it mentioned in the rehber?
  const dbNotInRehber = [];
  const dbInRehber = [];

  for (const row of dbRows) {
    const name = row.name;
    const norm = normalize(name);

    // Try multiple matching strategies
    const words = norm.split(" ").filter((w) => w.length > 2);
    const keyWords = words.filter(
      (w) =>
        !["ve", "ile", "ici", "yeri", "alani", "mesire", "piknik"].includes(w),
    );

    // Strategy 1: Full normalized name in rehber
    const rehberNorm = normalize(rehber);
    let found = rehberNorm.includes(norm);

    // Strategy 2: Check if the main identifying part is in the rehber
    if (!found) {
      // Extract the core name (before parentheses or dash)
      const coreName = name.split(/[\(\—\–]/)[0].trim();
      const coreNorm = normalize(coreName);
      if (coreNorm.length > 4) {
        found = rehberNorm.includes(coreNorm);
      }
    }

    // Strategy 3: Check key words (at least 2 significant words together)
    if (!found && keyWords.length >= 2) {
      // Check if at least the first 2 key words appear near each other
      const searchStr = keyWords.slice(0, 2).join(".*");
      try {
        const regex = new RegExp(searchStr);
        found = regex.test(rehberNorm);
      } catch (e) {}
    }

    if (found) {
      dbInRehber.push({ name, isActive: row.isActive });
    } else {
      dbNotInRehber.push({ name, isActive: row.isActive });
    }
  }

  console.log("=== SONUÇLAR ===\n");
  console.log(`DB toplam (soft-delete hariç): ${dbNames.length}`);
  console.log(`DB'de olup rehberde BULUNAN: ${dbInRehber.length}`);
  console.log(`DB'de olup rehberde BULUNMAYAN: ${dbNotInRehber.length}`);

  console.log("\n--- DB'de olup rehberde BULUNMAYAN yerler ---");
  for (const loc of dbNotInRehber) {
    console.log(`  ${loc.isActive ? "✅ AKTİF" : "⬜ İNAKTİF"} | ${loc.name}`);
  }

  console.log("\n--- DB'de olup rehberde BULUNAN yerler ---");
  for (const loc of dbInRehber) {
    console.log(`  ${loc.isActive ? "✅" : "⬜"} | ${loc.name}`);
  }

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
