/**
 * Gerçek Görsel Bulucu Servisi
 * ============================
 * Wikipedia & Wikimedia Commons API kullanarak
 * her lokasyonun gerçek fotoğrafını bulur.
 * Yanlış eşleşmeleri otomatik filtreler.
 */

const THUMB_WIDTH = 1024;
const UA = "BalikesirSmartCity/1.0 (https://kasif.erkanerdem.net; admin tool)";

async function fetchJSON(url: string): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function isUsableImage(url: string, filename = ""): boolean {
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

// Balıkesir ilçeleri
const DISTRICTS = [
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

/**
 * Wikipedia sayfasının gerçekten o lokasyonla ilgili olup olmadığını kontrol eder.
 */
function isRelevantPage(
  pageTitle: string,
  locationName: string,
  locationNameEn: string,
): boolean {
  const pageLower = pageTitle.toLowerCase().replace(/[,()]/g, " ").trim();
  const nameLower = locationName.toLowerCase().replace(/[,()]/g, " ").trim();
  const nameEnLower = (locationNameEn || "")
    .toLowerCase()
    .replace(/[,()]/g, " ")
    .trim();

  const nameWords = nameLower
    .split(/\s+/)
    .filter((w) => w.length > 2 && !["ve", "ile", "için", "veya"].includes(w));
  const nameEnWords = nameEnLower
    .split(/\s+/)
    .filter(
      (w) => w.length > 2 && !["and", "the", "for", "of", "in"].includes(w),
    );

  const matchCount = nameWords.filter((w) => pageLower.includes(w)).length;
  const matchCountEn = nameEnWords.filter((w) => pageLower.includes(w)).length;

  const locationDistrict = DISTRICTS.find((d) => nameLower.includes(d));
  const pageHasDistrict =
    locationDistrict && pageLower.includes(locationDistrict);

  if (pageLower.includes(nameLower) || nameLower.includes(pageLower))
    return true;
  if (pageHasDistrict && matchCount >= 1) return true;
  if (matchCount >= 2) return true;
  if (matchCountEn >= 2) return true;

  return false;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WikiQuery = Record<string, any>;

async function wikiPageImage(
  searchTerm: string,
  lang: string,
  locName: string,
  locNameEn: string,
): Promise<ImageFindResult | null> {
  const base = `https://${lang}.wikipedia.org/w/api.php`;
  const sr = (await fetchJSON(
    `${base}?action=query&format=json&list=search&srsearch=${encodeURIComponent(searchTerm)}&srlimit=5&utf8=1`,
  )) as WikiQuery | null;
  if (!sr?.query?.search?.length) return null;

  for (const page of sr.query.search) {
    if (!isRelevantPage(page.title, locName, locNameEn)) continue;

    const pr = (await fetchJSON(
      `${base}?action=query&format=json&titles=${encodeURIComponent(page.title)}&prop=pageimages&piprop=original|thumbnail&pithumbsize=${THUMB_WIDTH}`,
    )) as WikiQuery | null;
    if (!pr?.query?.pages) continue;

    for (const p of Object.values(pr.query.pages) as WikiQuery[]) {
      if (
        p.original?.source &&
        isUsableImage(p.original.source, p.pageimage || "")
      ) {
        return {
          imageUrl: p.thumbnail?.source || p.original.source,
          thumbUrl: p.thumbnail?.source || p.original.source,
          originalUrl: p.original.source,
          source: `${lang}.wikipedia - ${page.title}`,
          strategy: `${lang}-wiki-pageimage`,
        };
      }
    }
  }
  return null;
}

async function commonsSearch(
  searchTerm: string,
  locName: string,
): Promise<ImageFindResult | null> {
  const sr = (await fetchJSON(
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(searchTerm)}&srnamespace=6&srlimit=15&utf8=1`,
  )) as WikiQuery | null;
  if (!sr?.query?.search?.length) return null;

  const nameWords = locName
    .toLowerCase()
    .split(/[\s(),]+/)
    .filter((w) => w.length > 2);

  const jpgs = sr.query.search.filter((s: { title: string }) => {
    const t = s.title.toLowerCase();
    if (!(t.endsWith(".jpg") || t.endsWith(".jpeg"))) return false;
    if (!isUsableImage(t)) return false;
    return nameWords.some((w) => t.includes(w));
  });
  if (!jpgs.length) return null;

  const ir = (await fetchJSON(
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(jpgs[0].title)}&prop=imageinfo&iiprop=url|thumburl&iiurlwidth=${THUMB_WIDTH}`,
  )) as WikiQuery | null;
  if (!ir?.query?.pages) return null;

  for (const p of Object.values(ir.query.pages) as WikiQuery[]) {
    if (p.imageinfo?.[0]) {
      const info = p.imageinfo[0];
      return {
        imageUrl: info.thumburl || info.url,
        thumbUrl: info.thumburl || info.url,
        originalUrl: info.url,
        source: `commons - ${jpgs[0].title}`,
        strategy: "commons-search",
      };
    }
  }
  return null;
}

async function wikiAllImages(
  searchTerm: string,
  lang: string,
  locName: string,
  locNameEn: string,
): Promise<ImageFindResult | null> {
  const base = `https://${lang}.wikipedia.org/w/api.php`;
  const sr = (await fetchJSON(
    `${base}?action=query&format=json&list=search&srsearch=${encodeURIComponent(searchTerm)}&srlimit=3&utf8=1`,
  )) as WikiQuery | null;
  if (!sr?.query?.search?.length) return null;

  const relevantPage = sr.query.search.find((p: { title: string }) =>
    isRelevantPage(p.title, locName, locNameEn),
  );
  if (!relevantPage) return null;

  const title = relevantPage.title;
  const ir = (await fetchJSON(
    `${base}?action=query&format=json&titles=${encodeURIComponent(title)}&prop=images&imlimit=50`,
  )) as WikiQuery | null;
  if (!ir?.query?.pages) return null;

  const allImgs: string[] = [];
  for (const p of Object.values(ir.query.pages) as WikiQuery[]) {
    if (p.images)
      allImgs.push(...p.images.map((i: { title: string }) => i.title));
  }

  const jpgs = allImgs.filter((t) => {
    const l = t.toLowerCase();
    return (l.endsWith(".jpg") || l.endsWith(".jpeg")) && isUsableImage(l);
  });
  if (!jpgs.length) return null;

  const ci = (await fetchJSON(
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(jpgs[0])}&prop=imageinfo&iiprop=url|thumburl&iiurlwidth=${THUMB_WIDTH}`,
  )) as WikiQuery | null;
  if (!ci?.query?.pages) return null;

  for (const p of Object.values(ci.query.pages) as WikiQuery[]) {
    if (p.imageinfo?.[0]) {
      const info = p.imageinfo[0];
      return {
        imageUrl: info.thumburl || info.url,
        thumbUrl: info.thumburl || info.url,
        originalUrl: info.url,
        source: `${lang}.wikipedia (imgs) - ${title}`,
        strategy: `${lang}-wiki-allimages`,
      };
    }
  }
  return null;
}

// ─── Arama sonucu tipi ───
export interface ImageFindResult {
  imageUrl: string;
  thumbUrl: string;
  originalUrl: string;
  source: string;
  strategy: string;
}

/**
 * Tek bir lokasyon için gerçek görsel bul.
 * Tüm stratejileri sırayla dener. Yalnızca doğrulanmış sonuç döner.
 */
export async function findImageForLocation(
  name: string,
  nameEn: string,
): Promise<ImageFindResult | null> {
  const terms = [name, `${name} Balıkesir`];
  const paren = name.match(/\(([^)]+)\)/);
  if (paren) terms.push(`${paren[1]} Balıkesir`);
  terms.push(nameEn, `${nameEn} Balıkesir`);

  // 1. TR Wikipedia pageimage
  for (const term of terms) {
    const r = await wikiPageImage(term, "tr", name, nameEn);
    if (r) return r;
  }
  // 2. EN Wikipedia pageimage
  for (const term of terms) {
    const r = await wikiPageImage(term, "en", name, nameEn);
    if (r) return r;
  }
  // 3. Commons arama
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
