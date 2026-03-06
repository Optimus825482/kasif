/**
 * Wikimedia Commons API - search for images by query.
 * Used by admin to find images for locations that have none.
 */

const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
const DEFAULT_LIMIT = 15;

export interface WikimediaImage {
  url: string;
  thumbUrl: string;
  title: string;
  width?: number;
  height?: number;
}

export async function searchCommonsImages(
  query: string,
  limit: number = DEFAULT_LIMIT,
): Promise<WikimediaImage[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrnamespace: "6", // File namespace
    gsrsearch: trimmed,
    gsrlimit: String(Math.min(limit, 50)),
    prop: "imageinfo",
    iiprop: "url|size",
    iiurlwidth: "400",
    format: "json",
    origin: "*",
  });

  const res = await fetch(`${COMMONS_API}?${params.toString()}`, {
    headers: { "User-Agent": "BalikesirSmartCity/1.0 (https://github.com/; admin tool)" },
  });
  if (!res.ok) return [];

  const data = (await res.json()) as {
    query?: { pages?: Record<string, { title?: string; imageinfo?: Array<{ url?: string; thumburl?: string; thumbwidth?: number; thumbheight?: number; width?: number; height?: number }> }> };
  };
  const pages = data.query?.pages;
  if (!pages || typeof pages !== "object") return [];

  const results: WikimediaImage[] = [];
  for (const page of Object.values(pages)) {
    const info = page?.imageinfo?.[0];
    const title = page?.title ?? "";
    if (!info?.url || !title || title.startsWith("File:") === false) continue;
    const thumbUrl = info.thumburl ?? info.url;
    results.push({
      url: info.url,
      thumbUrl,
      title: title.replace(/^File:/i, ""),
      width: info.width,
      height: info.height,
    });
  }
  return results;
}
