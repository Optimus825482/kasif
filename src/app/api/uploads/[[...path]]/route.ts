import { NextRequest } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  const { path: pathSegments } = await params;
  const filename = pathSegments?.join("/");
  if (!filename || filename.includes("..")) {
    return new Response(null, { status: 400 });
  }

  const ext = path.extname(filename).toLowerCase();
  const contentType =
    ext === ".webp"
      ? "image/webp"
      : ext === ".png"
        ? "image/png"
        : ext === ".jpg" || ext === ".jpeg"
          ? "image/jpeg"
          : ext === ".avif"
            ? "image/avif"
            : "application/octet-stream";

  try {
    const filePath = path.join(UPLOADS_DIR, filename);
    const buffer = await readFile(filePath);
    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    return new Response(null, { status: 404 });
  }
}
