/**
 * GERÇEK GÖRSEL BULUCU v3 (Doğrulama Destekli)
 * =============================================
 * Her lokasyonun gerçek fotoğrafını bulur.
 * Yanlış eşleşmeleri filtreler.
 *
 * Kullanım: node scripts/find-real-images.mjs
 */

import pg from "pg";
import fs from "fs";

const THUMB_WIDTH = 1024;

const client = new pg.Client({
  connectionString:
    "postgresql://postgres:518518Erkan@localhost:5432/smartcity",
});

async function fetchJSON(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "SmartCity-ImageFinder/1.0 (erkan@erkanerdem.net)",
      },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Görsel dosya tipini kontrol et ───
function isUsableImage(url, filename = "") {
  const lower = (url + filename).toLowerCase();
  const bad = [
    "map",
    "flag",
    "coat_of_arms",
    "logo",
    "icon",
    "seal",
    "emblem",
    "districts",
    "province",
    "harita",
    "bayrak",
    ".svg",
    "locator",
    "location_map",
    "blank_map",
    "administrative",
    "arma",
    "sembol",
    "portrait",
    "headshot",
  ];
  return !bad.some((p) => lower.includes(p));
}

// ─── SAYFA ADININ İLGİLİ OLUP OLMADIĞINI KONTROL ET ───
// Bu fonksiyon yanlış eşleşmeleri önler
function isRelevantPage(pageTitle, locationName, locationNameEn) {
  const pageLower = pageTitle.toLowerCase().replace(/[,()]/g, " ").trim();
  const nameLower = locationName.toLowerCase().replace(/[,()]/g, " ").trim();
  const nameEnLower = (locationNameEn || "")
    .toLowerCase()
    .replace(/[,()]/g, " ")
    .trim();

  // Lokasyon adının ana kelimeleri sayfa başlığında var mı?
  const nameWords = nameLower
    .split(/\s+/)
    .filter(
      (w) =>
        w.length > 2 && !["ve", "ile", "için", "veya", "da", "de"].includes(w),
    );
  const nameEnWords = nameEnLower
    .split(/\s+/)
    .filter(
      (w) => w.length > 2 && !["and", "the", "for", "of", "in"].includes(w),
    );

  // Ana kelimelerden en az 1'i sayfa adında geçmeli
  const matchCount = nameWords.filter((w) => pageLower.includes(w)).length;
  const matchCountEn = nameEnWords.filter((w) => pageLower.includes(w)).length;

  // İlçe/bölge adı kontrolü - Balıkesir ilçeleri
  const districts = [
    "ayvalık",
    "bandırma",
    "balıkesir",
    "burhaniye",
    "edremit",
    "erdek",
    "gönen",
    "havran",
    "dursunbey",
    "sındırgı",
    "bigadiç",
    "manyas",
    "susurluk",
    "gömeç",
    "kepsut",
    "ivrindi",
    "balya",
    "altınoluk",
    "marmara",
    "cunda",
    "akçay",
    "güre",
    "zeytinli",
    "ören",
  ];

  const locationDistrict = districts.find((d) => nameLower.includes(d));
  const pageHasDistrict =
    locationDistrict && pageLower.includes(locationDistrict);

  // Doğrudan eşleşme: sayfa adı lokasyon adını veya tersini içeriyor
  if (pageLower.includes(nameLower) || nameLower.includes(pageLower))
    return true;
  if (pageHasDistrict && matchCount >= 1) return true;
  if (matchCount >= 2) return true;
  if (matchCountEn >= 2) return true;

  return false;
}

// ─── Wikipedia pageimage - Doğrulama ile ───
async function wikiPageImage(searchTerm, lang, locationName, locationNameEn) {
  const base = `https://${lang}.wikipedia.org/w/api.php`;
  const sr = await fetchJSON(
    `${base}?action=query&format=json&list=search&srsearch=${encodeURIComponent(searchTerm)}&srlimit=5&utf8=1`,
  );
  if (!sr?.query?.search?.length) return null;

  for (const page of sr.query.search) {
    // SAYFA İLGİLİ Mİ KONTROL ET
    if (!isRelevantPage(page.title, locationName, locationNameEn)) continue;

    const pageUrl = `${base}?action=query&format=json&titles=${encodeURIComponent(page.title)}&prop=pageimages&piprop=original|thumbnail&pithumbsize=${THUMB_WIDTH}`;
    const pr = await fetchJSON(pageUrl);
    if (!pr?.query?.pages) continue;

    for (const p of Object.values(pr.query.pages)) {
      if (
        p.original?.source &&
        isUsableImage(p.original.source, p.pageimage || "")
      ) {
        return {
          url: p.thumbnail?.source || p.original.source,
          originalUrl: p.original.source,
          source: `${lang}.wikipedia - ${page.title}`,
          strategy: `${lang}-wiki-pageimage`,
          pageTitle: page.title,
          verified: true,
        };
      }
    }
  }
  return null;
}

// ─── Wikimedia Commons - Doğrudan arama ───
async function commonsSearch(searchTerm, locationName) {
  // Daha spesifik arama yap
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(searchTerm)}&srnamespace=6&srlimit=15&utf8=1`;
  const sr = await fetchJSON(url);
  if (!sr?.query?.search?.length) return null;

  const nameWords = locationName
    .toLowerCase()
    .split(/[\s(),]+/)
    .filter((w) => w.length > 2);

  const jpgs = sr.query.search.filter((s) => {
    const t = s.title.toLowerCase();
    if (!(t.endsWith(".jpg") || t.endsWith(".jpeg"))) return false;
    if (!isUsableImage(t)) return false;
    // Dosya adı ilgili olmalı
    return nameWords.some((w) => t.includes(w));
  });
  if (!jpgs.length) return null;

  const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(jpgs[0].title)}&prop=imageinfo&iiprop=url|thumburl&iiurlwidth=${THUMB_WIDTH}`;
  const ir = await fetchJSON(infoUrl);
  if (!ir?.query?.pages) return null;

  for (const p of Object.values(ir.query.pages)) {
    if (p.imageinfo?.[0]) {
      const info = p.imageinfo[0];
      return {
        url: info.thumburl || info.url,
        originalUrl: info.url,
        source: `commons - ${jpgs[0].title}`,
        strategy: "commons-search",
        verified: true,
      };
    }
  }
  return null;
}

// ─── Wikipedia'da tüm sayfa görsellerini tara ───
async function wikiAllImages(searchTerm, lang, locationName, locationNameEn) {
  const base = `https://${lang}.wikipedia.org/w/api.php`;
  const sr = await fetchJSON(
    `${base}?action=query&format=json&list=search&srsearch=${encodeURIComponent(searchTerm)}&srlimit=3&utf8=1`,
  );
  if (!sr?.query?.search?.length) return null;

  // İlgili sayfayı bul
  const relevantPage = sr.query.search.find((p) =>
    isRelevantPage(p.title, locationName, locationNameEn),
  );
  if (!relevantPage) return null;

  const title = relevantPage.title;
  const ir = await fetchJSON(
    `${base}?action=query&format=json&titles=${encodeURIComponent(title)}&prop=images&imlimit=50`,
  );
  if (!ir?.query?.pages) return null;

  const allImgs = [];
  for (const p of Object.values(ir.query.pages)) {
    if (p.images) allImgs.push(...p.images.map((i) => i.title));
  }

  const jpgs = allImgs.filter((t) => {
    const l = t.toLowerCase();
    return (l.endsWith(".jpg") || l.endsWith(".jpeg")) && isUsableImage(l);
  });
  if (!jpgs.length) return null;

  const ci = await fetchJSON(
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(jpgs[0])}&prop=imageinfo&iiprop=url|thumburl&iiurlwidth=${THUMB_WIDTH}`,
  );
  if (!ci?.query?.pages) return null;

  for (const p of Object.values(ci.query.pages)) {
    if (p.imageinfo?.[0]) {
      const info = p.imageinfo[0];
      return {
        url: info.thumburl || info.url,
        originalUrl: info.url,
        source: `${lang}.wikipedia (imgs) - ${title}`,
        strategy: `${lang}-wiki-allimages`,
        verified: true,
      };
    }
  }
  return null;
}

// ─── Ana arama ───
async function findImageFor(loc) {
  const { name, nameEn } = loc;

  const terms = [name, `${name} Balıkesir`];
  const paren = name.match(/\(([^)]+)\)/);
  if (paren) terms.push(`${paren[1]} Balıkesir`);
  terms.push(nameEn, `${nameEn} Balıkesir`);

  // 1. TR Wikipedia pageimage (verified)
  for (const term of terms) {
    const r = await wikiPageImage(term, "tr", name, nameEn);
    if (r) return r;
  }

  // 2. EN Wikipedia pageimage (verified)
  for (const term of terms) {
    const r = await wikiPageImage(term, "en", name, nameEn);
    if (r) return r;
  }

  // 3. Commons arama (verified)
  for (const term of terms) {
    const r = await commonsSearch(term, name);
    if (r) return r;
  }

  // 4. TR Wikipedia tüm görseller
  for (const term of terms.slice(0, 2)) {
    const r = await wikiAllImages(term, "tr", name, nameEn);
    if (r) return r;
  }

  // 5. EN Wikipedia tüm görseller
  for (const term of terms.slice(3)) {
    const r = await wikiAllImages(term, "en", name, nameEn);
    if (r) return r;
  }

  return null;
}

// ─── Paralel işleme ───
async function processInBatches(items, batchSize, fn) {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);
    if (i + batchSize < items.length) await sleep(300);
  }
  return results;
}

// ─── MAIN ───
async function main() {
  await client.connect();

  const { rows: locations } = await client.query(`
    SELECT l.id, l.name, l."nameEn", c.name as category_name
    FROM "Location" l
    LEFT JOIN "Category" c ON l."categoryId" = c.id
    WHERE l."deletedAt" IS NULL AND l."isActive" = true
      AND (l.images IS NULL OR array_length(l.images, 1) IS NULL OR array_length(l.images, 1) = 0)
    ORDER BY c.name, l.name
  `);

  console.log(
    `\n🔍 ${locations.length} görselsiz kayıt. Doğrulamalı arama başlıyor...\n`,
  );

  const found = [];
  const notFound = [];
  let processed = 0;

  const results = await processInBatches(locations, 3, async (loc) => {
    const result = await findImageFor(loc);
    processed++;
    const prefix = `[${processed}/${locations.length}]`;

    if (result) {
      console.log(
        `${prefix} ✅ ${loc.name} → ${result.strategy} (${result.source})`,
      );
      return { loc, result };
    } else {
      console.log(`${prefix} ❌ ${loc.name}`);
      return { loc, result: null };
    }
  });

  for (const { loc, result } of results) {
    if (result) {
      found.push({
        id: loc.id,
        name: loc.name,
        nameEn: loc.nameEn,
        category: loc.category_name,
        imageUrl: result.url,
        originalUrl: result.originalUrl,
        source: result.source,
        strategy: result.strategy,
      });
    } else {
      notFound.push({
        id: loc.id,
        name: loc.name,
        nameEn: loc.nameEn,
        category: loc.category_name,
      });
    }
  }

  const output = {
    timestamp: new Date().toISOString(),
    summary: {
      total: locations.length,
      found: found.length,
      notFound: notFound.length,
    },
    found,
    notFound,
  };

  fs.writeFileSync(
    "scripts/found-images.json",
    JSON.stringify(output, null, 2),
  );

  console.log(`\n${"═".repeat(50)}`);
  console.log(`📊 DOĞRULANMIŞ SONUÇ RAPORU`);
  console.log(`${"═".repeat(50)}`);
  console.log(`   Toplam:          ${locations.length}`);
  console.log(`   ✅ Doğrulanmış:   ${found.length}`);
  console.log(`   ❌ Bulunamayan:   ${notFound.length}`);
  console.log(`${"═".repeat(50)}`);

  if (notFound.length > 0) {
    console.log(`\n❌ BULUNAMAYAN (Manuel arama gerekli):`);
    for (const loc of notFound) {
      console.log(`   [${loc.category}] ${loc.name}`);
    }
  }

  console.log(`\n📁 Sonuçlar: scripts/found-images.json`);
  console.log(`📝 Uygulama: node scripts/apply-images.mjs\n`);

  await client.end();
}

main().catch((err) => {
  console.error("HATA:", err);
  process.exit(1);
});
