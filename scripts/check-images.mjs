import pg from "pg";

const client = new pg.Client({
  connectionString:
    "postgresql://postgres:518518Erkan@localhost:5432/smartcity",
});

await client.connect();

const result = await client.query(`
  SELECT id, name, "nameEn", images, "categoryId"
  FROM "Location"
  WHERE "deletedAt" IS NULL AND "isActive" = true
  ORDER BY name
`);

console.log(`\nToplam aktif kayıt: ${result.rows.length}\n`);

const noImage = result.rows.filter((r) => !r.images || r.images.length === 0);
const hasImage = result.rows.filter((r) => r.images && r.images.length > 0);

console.log(`Görseli OLAN: ${hasImage.length}`);
console.log(`Görseli OLMAYAN: ${noImage.length}`);
console.log("\n--- GÖRSELİ OLMAYAN KAYITLAR ---\n");

for (const loc of noImage) {
  console.log(
    `ID: ${loc.id} | İsim: ${loc.name} | EN: ${loc.nameEn} | images: ${JSON.stringify(loc.images)}`,
  );
}

// Also show ones with empty arrays or placeholder images
console.log("\n--- BOŞ VEYA PLACEHOLDER GÖRSELLİ KAYITLAR ---\n");
const placeholder = result.rows.filter((r) => {
  if (!r.images || r.images.length === 0) return false;
  return r.images.some(
    (img) =>
      img.includes("placeholder") || img.includes("default") || img === "",
  );
});

for (const loc of placeholder) {
  console.log(
    `ID: ${loc.id} | İsim: ${loc.name} | images: ${JSON.stringify(loc.images)}`,
  );
}

// Show categories
const catResult = await client.query(
  `SELECT id, name FROM "Category" ORDER BY name`,
);
console.log("\n--- KATEGORİLER ---\n");
for (const cat of catResult.rows) {
  console.log(`${cat.id}: ${cat.name}`);
}

await client.end();
