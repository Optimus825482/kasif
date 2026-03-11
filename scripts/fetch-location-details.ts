/**
 * coordinates.json'daki her lokasyon için tüm kaynaklardan bilgi toplar, doğrular, tek dosyaya yazar.
 * Kaynaklar: Wikipedia (TR/EN) → Wikidata → OSM (koordinattan adres). OSM varsayılan açık.
 * Çıktı: location-details.json (seed ile kullanılır). --no-osm ile OSM kapatılır.
 *
 * Çalıştırma: npx tsx scripts/fetch-location-details.ts
 */

import fs from "fs";
import path from "path";

const UA =
  "BalikesirSmartCity/1.0 (location-details fetcher; https://smartcity.balikesir.bel.tr)";
const FETCH_OSM = !process.argv.includes("--no-osm");

interface CoordEntry {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

interface SuggestedEntry {
  name: string;
  nameEn?: string;
  description?: string;
  descriptionEn?: string;
  shortDesc?: string;
  shortDescEn?: string;
  address?: string;
  wikipediaTitleTr?: string;
  wikipediaTitleEn?: string;
  wikidataId?: string;
  osmDisplayName?: string;
  source?: string;
}

/** Sayfa başlığı lokasyon adıyla makul ölçüde uyuşuyor mu? Yanlış eşleşmeleri (Galata Kulesi vs Atatürk Kayalıkları) eler. */
function isRelevantTitle(locationName: string, pageTitle: string): boolean {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[(),\-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  const loc = norm(locationName);
  const page = norm(pageTitle);
  const locWords = loc
    .split(" ")
    .filter(
      (w) =>
        w.length > 2 && !["ile", "ve", "için", "the", "and", "for"].includes(w),
    );
  if (locWords.length === 0) return true;
  const matchCount = locWords.filter((w) => page.includes(w)).length;
  const minMatch =
    locWords.length <= 2 ? 1 : Math.min(2, Math.ceil(locWords.length / 2));
  return matchCount >= minMatch;
}

async function fetchJson<T>(
  url: string,
  extraHeaders?: Record<string, string>,
): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, ...extraHeaders },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function getWikipediaPage(
  lang: "tr" | "en",
  searchName: string,
  locationName: string,
): Promise<{ title: string; extract: string } | null> {
  const base = `https://${lang}.wikipedia.org/w/api.php`;
  const searchRes = await fetchJson<{
    query?: { search?: Array<{ title: string; pageid: number }> };
  }>(
    `${base}?origin=*&action=query&format=json&list=search&srsearch=${encodeURIComponent(searchName)}&srlimit=5&utf8=1`,
  );
  const hits = searchRes?.query?.search ?? [];
  for (const page of hits) {
    if (!page?.title) continue;
    if (page.title.startsWith("List of ")) continue;
    if (/\s\((dizi|film)\)$/i.test(page.title)) continue;
    if (!isRelevantTitle(locationName, page.title)) continue;

    const pageRes = await fetchJson<{
      query?: { pages?: Record<string, { extract?: string }> };
    }>(
      `${base}?origin=*&action=query&format=json&prop=extracts&exintro=1&explaintext=1&exsentences=5&titles=${encodeURIComponent(page.title)}`,
    );
    const pages = pageRes?.query?.pages;
    if (!pages) continue;
    const first = Object.values(pages)[0];
    const extract = first?.extract?.trim();
    if (!extract || extract.length < 50) continue;
    return { title: page.title, extract };
  }
  return null;
}

function truncateShort(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const idx = text.lastIndexOf(" ", maxLen);
  return (idx > 0 ? text.slice(0, idx) : text.slice(0, maxLen)) + "…";
}

/** Wikidata: isimle ara; uygun entity'nin TR/EN açıklamasını ve label'ını getir. */
async function getWikidata(locationName: string): Promise<{
  id: string;
  labelTr?: string;
  labelEn?: string;
  descTr?: string;
  descEn?: string;
} | null> {
  const base = "https://www.wikidata.org/w/api.php";
  const searchRes = await fetchJson<{
    search?: Array<{ id: string; label: string; description?: string }>;
  }>(
    `${base}?origin=*&action=wbsearchentities&search=${encodeURIComponent(locationName)}&language=tr&limit=5&format=json`,
  );
  const hits = searchRes?.search ?? [];
  for (const item of hits) {
    if (!item?.id) continue;
    const label =
      "label" in item ? String((item as { label?: string }).label ?? "") : "";
    if (label && !isRelevantTitle(locationName, label)) continue;
    const entityRes = await fetchJson<{
      entities?: Record<
        string,
        {
          labels?: Record<string, { value: string }>;
          descriptions?: Record<string, { value: string }>;
        }
      >;
    }>(
      `${base}?origin=*&action=wbgetentities&ids=${item.id}&props=labels|descriptions&format=json`,
    );
    const entity = entityRes?.entities?.[item.id];
    if (!entity) continue;
    const labels = entity.labels ?? {};
    const descriptions = entity.descriptions ?? {};
    const labelTr = labels.tr?.value ?? labels.en?.value;
    const labelEn = labels.en?.value ?? labels.tr?.value;
    const descTr = descriptions.tr?.value;
    const descEn = descriptions.en?.value;
    if (descTr || descEn || labelTr || labelEn) {
      return {
        id: item.id,
        labelTr: labelTr || undefined,
        labelEn: labelEn || undefined,
        descTr: descTr || undefined,
        descEn: descEn || undefined,
      };
    }
  }
  return null;
}

/** OpenStreetMap Nominatim: mevcut koordinattan reverse geocoding ile adres al. */
async function getNominatimReverse(
  lat: number,
  lon: number,
): Promise<{ displayName: string; address?: Record<string, string> } | null> {
  if (!FETCH_OSM) return null;
  const res = await fetchJson<{
    display_name?: string;
    address?: Record<string, string>;
  }>(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
    { "Accept-Language": "tr" },
  );
  if (!res?.display_name) return null;
  return { displayName: res.display_name, address: res.address };
}

async function main() {
  const cwd = process.cwd();
  const coordsPath = path.join(cwd, "data", "coordinates.json");
  if (!fs.existsSync(coordsPath)) {
    console.error("coordinates.json bulunamadı.");
    process.exit(1);
  }

  const coords: CoordEntry[] = JSON.parse(fs.readFileSync(coordsPath, "utf-8"));
  if (!Array.isArray(coords)) {
    console.error("coordinates.json geçerli bir dizi değil.");
    process.exit(1);
  }

  const suggested: SuggestedEntry[] = [];
  const total = coords.length;
  let done = 0;

  for (const entry of coords) {
    const name = entry.name;
    const sources: string[] = [];

    const trPage = await getWikipediaPage("tr", name, name);
    const enPage = await getWikipediaPage("en", name, name);
    let description: string | undefined;
    let shortDesc: string | undefined;
    let descriptionEn: string | undefined;
    let shortDescEn: string | undefined;
    let nameEn: string | undefined;
    let wikipediaTitleTr: string | undefined;
    let wikipediaTitleEn: string | undefined;

    if (trPage) {
      description = trPage.extract;
      shortDesc = truncateShort(trPage.extract, 120);
      wikipediaTitleTr = trPage.title;
      sources.push("Wikipedia");
    }
    if (enPage) {
      descriptionEn = enPage.extract;
      shortDescEn = truncateShort(enPage.extract, 120);
      nameEn = enPage.title;
      wikipediaTitleEn = enPage.title;
      if (!sources.includes("Wikipedia")) sources.push("Wikipedia");
    }

    let wikidataId: string | undefined;
    const wd = await getWikidata(name);
    if (wd) {
      if (!description && wd.descTr) {
        description = wd.descTr;
        shortDesc = truncateShort(wd.descTr, 120);
      }
      if (!descriptionEn && wd.descEn) {
        descriptionEn = wd.descEn;
        shortDescEn = truncateShort(wd.descEn, 120);
      }
      if (!nameEn && wd.labelEn) nameEn = wd.labelEn;
      wikidataId = wd.id;
      if (!sources.includes("Wikidata")) sources.push("Wikidata");
      await new Promise((r) => setTimeout(r, 350));
    }

    let address: string | undefined;
    let osmDisplayName: string | undefined;
    const osm = await getNominatimReverse(entry.latitude, entry.longitude);
    if (osm) {
      osmDisplayName = osm.displayName;
      if (osm.address) {
        const parts = [
          osm.address.road,
          osm.address.suburb,
          osm.address.town,
          osm.address.state,
          "Türkiye",
        ].filter(Boolean);
        address = parts.join(", ");
      }
      if (!sources.includes("OSM")) sources.push("OSM");
      await new Promise((r) => setTimeout(r, 1100));
    }

    suggested.push({
      name,
      ...(nameEn && { nameEn }),
      ...(description && { description }),
      ...(shortDesc && { shortDesc }),
      ...(descriptionEn && { descriptionEn }),
      ...(shortDescEn && { shortDescEn }),
      ...(address && { address }),
      ...(wikipediaTitleTr && { wikipediaTitleTr }),
      ...(wikipediaTitleEn && { wikipediaTitleEn }),
      ...(wikidataId && { wikidataId }),
      ...(osmDisplayName && { osmDisplayName }),
      source: sources.length
        ? `${sources.join(" + ")} (öneri - doğrulanmadı)`
        : "Kaynak bulunamadı",
    });
    done++;
    if (done % 10 === 0 || done === total) {
      console.log(`İşlendi: ${done}/${total}`);
    }
    await new Promise((r) => setTimeout(r, 300));
  }

  const WRONG_TR = [
    "divriği",
    "yol arkadaşım",
    "çine kuvayı",
    "yıldırım külliyesi",
    "prizren",
    "karatepe",
    "fethiye müzesi",
    "galata kulesi",
    "istanbul metrosu",
  ];
  const WRONG_EN = ["list of ", "sea of marmara"];

  for (const entry of suggested) {
    const titleTr = (entry.wikipediaTitleTr ?? "").toLowerCase();
    const titleEn = (entry.wikipediaTitleEn ?? "").toLowerCase();
    const descTr = (entry.description ?? "").toLowerCase();
    const wrongTr =
      WRONG_TR.some((p) => titleTr.includes(p)) ||
      (descTr.includes("divriği") && descTr.includes("sivas")) ||
      (descTr.includes("bursa'da") &&
        entry.name.includes("Yıldırım") &&
        !entry.name.includes("Bursa")) ||
      (entry.name.includes("Bandırma") && descTr.includes("altıeylül"));
    const wrongEn = WRONG_EN.some((p) => titleEn.includes(p));
    if (wrongTr) {
      entry.description = undefined;
      entry.shortDesc = undefined;
      entry.wikipediaTitleTr = undefined;
    }
    if (wrongEn) {
      entry.descriptionEn = undefined;
      entry.shortDescEn = undefined;
      entry.nameEn = entry.wikipediaTitleEn ? undefined : entry.nameEn;
      entry.wikipediaTitleEn = undefined;
    }
  }

  const seedReady = suggested.map((e) => ({
    name: e.name,
    ...(e.nameEn && { nameEn: e.nameEn }),
    ...(e.description && { description: e.description }),
    ...(e.descriptionEn && { descriptionEn: e.descriptionEn }),
    ...(e.shortDesc && { shortDesc: e.shortDesc }),
    ...(e.shortDescEn && { shortDescEn: e.shortDescEn }),
    ...(e.address && { address: e.address }),
    source: e.source?.replace(" (öneri - doğrulanmadı)", "") ?? "Toplandı",
  }));

  const outPath = path.join(cwd, "data", "location-details.json");
  fs.writeFileSync(outPath, JSON.stringify(seedReady, null, 2), "utf-8");
  console.log(`Toplam ${seedReady.length} lokasyon yazıldı: ${outPath}`);
  console.log("Seed için: npm run db:seed");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
