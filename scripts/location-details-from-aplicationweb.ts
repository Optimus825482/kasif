/**
 * aplicationweb.json (API/uygulama export) içeriğini coordinates.json sırasına göre
 * location-details.json formatına dönüştürür. Seed bu dosyayı kullanır.
 *
 * Çalıştırma: npx tsx scripts/location-details-from-aplicationweb.ts
 */

import fs from "fs";
import path from "path";

interface AplicationEntry {
  name: string;
  nameEn?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  shortDesc?: string | null;
  shortDescEn?: string | null;
  address?: string | null;
  addressEn?: string | null;
  visitHours?: string | null;
  fee?: string | null;
  feeEn?: string | null;
  images?: string[] | null;
  website?: string | null;
  phone?: string | null;
  publicTransport?: string | null;
  publicTransportEn?: string | null;
  isFeatured?: boolean | null;
  isActive?: boolean | null;
  category?: { slug?: string } | null;
}

interface CoordEntry {
  name: string;
}

function main() {
  const cwd = process.cwd();
  const appPath = path.join(cwd, "aplicationweb.json");
  const coordsPath = path.join(cwd, "data", "coordinates.json");

  if (!fs.existsSync(appPath)) {
    console.error("aplicationweb.json bulunamadı.");
    process.exit(1);
  }
  if (!fs.existsSync(coordsPath)) {
    console.error("coordinates.json bulunamadı.");
    process.exit(1);
  }

  const appEntries: AplicationEntry[] = JSON.parse(
    fs.readFileSync(appPath, "utf-8"),
  );
  const coords: CoordEntry[] = JSON.parse(fs.readFileSync(coordsPath, "utf-8"));
  const appByName = new Map(appEntries.map((e) => [e.name.trim(), e]));

  const details: Record<string, unknown>[] = [];

  for (const coord of coords) {
    const name = coord.name.trim();
    const app = appByName.get(name);
    if (!app) {
      details.push({ name, source: "aplicationweb (eşleşme yok)" });
      continue;
    }

    const entry: Record<string, unknown> = { name };
    if (app.nameEn) entry.nameEn = app.nameEn;
    if (app.description) entry.description = app.description;
    if (app.descriptionEn) entry.descriptionEn = app.descriptionEn;
    if (app.shortDesc) entry.shortDesc = app.shortDesc;
    if (app.shortDescEn) entry.shortDescEn = app.shortDescEn;
    if (app.address) entry.address = app.address;
    if (app.addressEn) entry.addressEn = app.addressEn;
    if (app.visitHours) entry.visitHours = app.visitHours;
    if (app.fee) entry.fee = app.fee;
    if (app.feeEn) entry.feeEn = app.feeEn;
    if (app.category?.slug) entry.categorySlug = app.category.slug;
    if (app.images?.length) entry.images = app.images;
    if (app.website) entry.website = app.website;
    if (app.phone) entry.phone = app.phone;
    if (app.publicTransport) entry.publicTransport = app.publicTransport;
    if (app.publicTransportEn) entry.publicTransportEn = app.publicTransportEn;
    if (app.isFeatured != null) entry.isFeatured = app.isFeatured;
    if (app.isActive != null) entry.isActive = app.isActive;
    entry.source = "aplicationweb";

    details.push(entry);
  }

  const outPath = path.join(cwd, "data", "location-details.json");
  fs.writeFileSync(outPath, JSON.stringify(details, null, 2), "utf-8");
  console.log(
    `location-details.json yazıldı: ${details.length} lokasyon (aplicationweb.json kaynaklı).`,
  );
}

main();
