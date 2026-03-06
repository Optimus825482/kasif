/**
 * coordinates.json dosyasındaki koordinatları veritabanındaki lokasyonlara uygular.
 * Eşleşme: Lokasyon.name veya Location.nameEn ile coordinates.json'daki "name" alanı.
 *
 * Kullanım: npm run update-coordinates
 * (coordinates.json proje kökünde olmalı)
 */

import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface CoordEntry {
  name: string;
  lat: number;
  lng: number;
}

async function main() {
  const jsonPath = path.resolve(process.cwd(), "coordinates.json");
  if (!fs.existsSync(jsonPath)) {
    console.error("coordinates.json bulunamadı:", jsonPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(jsonPath, "utf-8");
  const entries: CoordEntry[] = JSON.parse(raw);
  if (!Array.isArray(entries)) {
    console.error("coordinates.json bir dizi (array) olmalı.");
    process.exit(1);
  }

  let updated = 0;
  const notFound: string[] = [];

  for (const { name, lat, lng } of entries) {
    if (typeof name !== "string" || typeof lat !== "number" || typeof lng !== "number") {
      continue;
    }

    // Önce tam eşleşme (name / nameEn), yoksa büyük/küçük harf duyarsız tam eşleşme
    let loc = await prisma.location.findFirst({
      where: {
        deletedAt: null,
        OR: [{ name: name }, { nameEn: name }],
      },
    });
    if (!loc) {
      const norm = name.trim();
      const all = await prisma.location.findMany({
        where: { deletedAt: null },
        select: { id: true, name: true, nameEn: true },
      });
      loc = all.find(
        (l) =>
          l.name?.trim().toLowerCase() === norm.toLowerCase() ||
          l.nameEn?.trim().toLowerCase() === norm.toLowerCase(),
      ) ?? null;
    }

    if (!loc) {
      notFound.push(name);
      continue;
    }

    await prisma.location.update({
      where: { id: loc.id },
      data: { latitude: lat, longitude: lng },
    });
    updated++;
    console.log(`OK: ${name} -> ${lat}, ${lng}`);
  }

  console.log("\n--- Özet ---");
  console.log("Güncellenen:", updated);
  if (notFound.length > 0) {
    console.log("Bulunamayan (isim eşleşmedi):", notFound.length);
    notFound.slice(0, 20).forEach((n) => console.log("  -", n));
    if (notFound.length > 20) console.log("  ...");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
