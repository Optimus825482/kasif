/**
 * Wikimedia görselleri doğrudan yüklenince 429 (Too Many Requests) alınabiliyor.
 * Bu URL'ler için proxy kullanarak istekleri sunucu üzerinden yapıyoruz.
 */
const WIKIMEDIA_HOSTS = [
  "upload.wikimedia.org",
  "commons.wikimedia.org",
];

export function isWikimediaImageUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  try {
    const host = new URL(url, "https://example.com").hostname.toLowerCase();
    return WIKIMEDIA_HOSTS.some((h) => host === h || host.endsWith("." + h));
  } catch {
    return false;
  }
}

/**
 * Görsel URL'si: Wikimedia ise proxy üzerinden, değilse aynen döner.
 */
export function getImageSrc(url: string): string {
  if (!url) return url;
  if (isWikimediaImageUrl(url)) {
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  }
  return url;
}
