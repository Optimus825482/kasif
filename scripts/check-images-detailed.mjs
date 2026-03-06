import pg from "pg";

const client = new pg.Client({
  connectionString:
    "postgresql://postgres:518518Erkan@localhost:5432/smartcity",
});

await client.connect();

const result = await client.query(`
  SELECT l.id, l.name, l."nameEn", l.images, c.name as category_name
  FROM "Location" l
  LEFT JOIN "Category" c ON l."categoryId" = c.id
  WHERE l."deletedAt" IS NULL AND l."isActive" = true 
    AND (l.images IS NULL OR array_length(l.images, 1) IS NULL OR array_length(l.images, 1) = 0)
  ORDER BY c.name, l.name
`);

console.log(`\nGÖRSELİ OLMAYAN TOPLAM KAYIT: ${result.rows.length}\n`);

let currentCat = "";
for (const loc of result.rows) {
  if (loc.category_name !== currentCat) {
    currentCat = loc.category_name;
    console.log(`\n=== ${currentCat} ===`);
  }
  console.log(`  - ${loc.name} (${loc.nameEn})`);
}

// Also check what images look like for those that have them
const withImages = await client.query(`
  SELECT l.name, l.images[1] as first_image
  FROM "Location" l
  WHERE l."deletedAt" IS NULL AND l."isActive" = true 
    AND array_length(l.images, 1) > 0
  LIMIT 5
`);

console.log("\n\n--- MEVCUT GÖRSEL ÖRNEKLER (format referans) ---\n");
for (const loc of withImages.rows) {
  console.log(`${loc.name}: ${loc.first_image}`);
}

await client.end();
