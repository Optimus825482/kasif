import { NextRequest } from "next/server";

const ALLOWED_HOSTS = [
  "upload.wikimedia.org",
  "commons.wikimedia.org",
];

function isAllowedUrl(url: string): boolean {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    return ALLOWED_HOSTS.some((h) => host === h || host.endsWith("." + h));
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url || !isAllowedUrl(url)) {
    return new Response(null, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "BalikesirDijitalKasif/1.0 (https://kasif.erkanerdem.net; image proxy)",
      },
      next: { revalidate: 86400 }, // 24h cache
    });
    if (!res.ok) return new Response(null, { status: res.status });

    const contentType = res.headers.get("Content-Type") || "image/jpeg";
    if (!contentType.startsWith("image/")) {
      return new Response(null, { status: 502 });
    }
    const buffer = await res.arrayBuffer();
    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch {
    return new Response(null, { status: 502 });
  }
}
