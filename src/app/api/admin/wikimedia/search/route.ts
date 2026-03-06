import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { searchCommonsImages } from "@/services/wikimedia.service";

export async function GET(req: NextRequest) {
  const admin = verifyToken(req);
  if (!admin) return errorResponse("Yetkisiz erişim", 401, "UNAUTHORIZED");

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 15));

  try {
    const images = await searchCommonsImages(q, limit);
    return successResponse({ images });
  } catch (err) {
    console.error("[admin/wikimedia/search]", err);
    return errorResponse("Wikimedia araması başarısız", 500);
  }
}
