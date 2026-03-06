// Compare seed.ts coordinates with KK.MD coordinates
// Extract lat/lng from seed.ts and match against KK.MD data

import { readFileSync } from "fs";

const seed = readFileSync("smartcity-app/prisma/seed.ts", "utf-8");
const kk = readFileSync("KK.MD", "utf-8");

// Parse KK.MD - extract name + coordinates
const kkLocations = [];
const lines = kk.split("\n");
for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  // Match coordinate pattern: number, number
  const coordMatch = line.match(/^(\d+\.\d+),\s*(\d+\.\d+)$/);
  if (coordMatch) {
    // Previous non-empty line is the name
    let name = "";
    for (let j = i - 1; j >= 0; j--) {
      const prev = lines[j].trim();
      if (
        prev &&
        prev !== "Yer" &&
        prev !== "Koordinat" &&
        prev !== "Not" &&
        !prev.match(/^\d+\.\d+/)
      ) {
        name = prev;
        break;
      }
    }
    // Next non-empty line might be the note
    let note = "";
    for (let k = i + 1; k < lines.length; k++) {
      const next = lines[k].trim();
      if (
        next &&
        !next.match(/^\d+\.\d+/) &&
        next !== "Yer" &&
        next !== "Koordinat" &&
        next !== "Not"
      ) {
        note = next;
        break;
      }
    }
    kkLocations.push({
      name,
      lat: parseFloat(coordMatch[1]),
      lng: parseFloat(coordMatch[2]),
      note,
    });
  }
}

// Parse seed.ts - extract latitude/longitude values with names
const seedLocations = [];
const nameRegex = /name:\s*`([^`]+)`/g;
const latRegex = /latitude:\s*([\d.]+)/g;
const lngRegex = /longitude:\s*([\d.]+)/g;

// Find all location blocks
const locBlocks = seed.split(/\{\s*\n\s*name:/g);
for (let i = 1; i < locBlocks.length; i++) {
  const block = "name:" + locBlocks[i];
  const nameM = block.match(/name:\s*`([^`]+)`/);
  const latM = block.match(/latitude:\s*([\d.]+)/);
  const lngM = block.match(/longitude:\s*([\d.]+)/);
  if (nameM && latM && lngM) {
    seedLocations.push({
      name: nameM[1],
      lat: parseFloat(latM[1]),
      lng: parseFloat(lngM[1]),
    });
  }
}

console.log("=== KK.MD locations:", kkLocations.length);
console.log("=== Seed locations:", seedLocations.length);

// Find matches (same or similar name)
console.log("\n=== COORDINATE COMPARISON (matching locations) ===");
const matched = new Set();
for (const kk of kkLocations) {
  for (const s of seedLocations) {
    // Fuzzy name match
    const kkNorm = kk.name.toLowerCase().replace(/[^a-zçğıöşü0-9]/g, "");
    const sNorm = s.name.toLowerCase().replace(/[^a-zçğıöşü0-9]/g, "");
    if (
      kkNorm.includes(sNorm.substring(0, 8)) ||
      sNorm.includes(kkNorm.substring(0, 8)) ||
      (kk.name.includes("Saat Kule") && s.name.includes("Saat Kule")) ||
      (kk.name.includes("Şeytan") && s.name.includes("Şeytan")) ||
      (kk.name.includes("Sutüven") && s.name.includes("Sütüven")) ||
      (kk.name.includes("Şahindere") && s.name.includes("Şahindere")) ||
      (kk.name.includes("Cunda") && s.name.includes("Cunda")) ||
      (kk.name.includes("Değirmen Boğazı") &&
        s.name.includes("Değirmenboğazı")) ||
      (kk.name.includes("Güre Kaplıca") && s.name.includes("Gönen Kaplıca")) ||
      (kk.name.includes("Ören Plajı") && s.name.includes("Erdek")) ||
      (kk.name.includes("Ocaklar") && s.name.includes("Erdek")) ||
      (kk.name.includes("Avşa") && s.name.includes("Avşa")) ||
      (kk.name.includes("Saraylar") && s.name.includes("Saraylar"))
    ) {
      const latDiff = Math.abs(kk.lat - s.lat);
      const lngDiff = Math.abs(kk.lng - s.lng);
      if (latDiff > 0.001 || lngDiff > 0.001) {
        console.log(`DIFF: "${kk.name}" vs "${s.name}"`);
        console.log(`  KK.MD: ${kk.lat}, ${kk.lng}`);
        console.log(`  Seed:  ${s.lat}, ${s.lng}`);
        console.log(
          `  Delta: lat=${latDiff.toFixed(4)}, lng=${lngDiff.toFixed(4)}`,
        );
      } else {
        console.log(`OK: "${kk.name}" ≈ "${s.name}" (${kk.lat}, ${kk.lng})`);
      }
      matched.add(kk.name);
    }
  }
}

// Find KK.MD locations NOT in seed
console.log("\n=== NEW LOCATIONS (in KK.MD but NOT in seed) ===");
const newLocs = kkLocations.filter((k) => !matched.has(k.name));
newLocs.forEach((l) =>
  console.log(`NEW: ${l.name} (${l.lat}, ${l.lng}) - ${l.note}`),
);
console.log(`\nTotal new: ${newLocs.length}`);
