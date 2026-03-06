import pg from "pg";
import fs from "fs";

const client = new pg.Client({
  connectionString:
    "postgresql://postgres:518518Erkan@localhost:5432/smartcity",
});

await client.connect();

const withImages = await client.query(`
  SELECT l.name, l.images, c.name as category_name
  FROM "Location" l
  LEFT JOIN "Category" c ON l."categoryId" = c.id
  WHERE l."deletedAt" IS NULL AND l."isActive" = true 
    AND array_length(l.images, 1) > 0
  ORDER BY c.name, l.name
`);

const noImages = await client.query(`
  SELECT l.id, l.name, l."nameEn", c.name as category_name, c."nameEn" as category_name_en
  FROM "Location" l
  LEFT JOIN "Category" c ON l."categoryId" = c.id
  WHERE l."deletedAt" IS NULL AND l."isActive" = true 
    AND (l.images IS NULL OR array_length(l.images, 1) IS NULL OR array_length(l.images, 1) = 0)
  ORDER BY c.name, l.name
`);

let report = "=== MEVCUT GÖRSEL FORMATLARI ===\n\n";
for (const loc of withImages.rows) {
  report += `[${loc.category_name}] ${loc.name}:\n`;
  for (const img of loc.images) {
    report += `  -> ${img}\n`;
  }
}

report += "\n\n=== GÖRSELSİZ KAYITLAR ===\n\n";
let currentCat = "";
for (const loc of noImages.rows) {
  if (loc.category_name !== currentCat) {
    currentCat = loc.category_name;
    report += `\n--- ${currentCat} ---\n`;
  }
  report += `  ID: ${loc.id} | ${loc.name} (${loc.nameEn})\n`;
}

report += `\n\nTOPLAM GÖRSELLİ: ${withImages.rows.length}\n`;
report += `TOPLAM GÖRSELSİZ: ${noImages.rows.length}\n`;

fs.writeFileSync("scripts/image-report.txt", report);
console.log("Rapor scripts/image-report.txt dosyasına yazıldı");
console.log(
  `Görselli: ${withImages.rows.length}, Görselsiz: ${noImages.rows.length}`,
);

await client.end();
