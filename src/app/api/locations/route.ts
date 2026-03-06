import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { LocationService } from "@/services/location.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 50;
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || undefined;
    const lat = searchParams.get("latitude");
    const lng = searchParams.get("longitude");
    const radiusKm = searchParams.get("radiusKm");
    const excludeId = searchParams.get("excludeId") || undefined;

    const latitude = lat ? Number(lat) : undefined;
    const longitude = lng ? Number(lng) : undefined;
    const radiusKmNum =
      radiusKm != null && radiusKm !== ""
        ? Number(radiusKm)
        : undefined;

    const result = await LocationService.list({
      page,
      limit,
      search,
      categoryId,
      latitude,
      longitude,
      radiusKm: radiusKmNum,
      excludeId,
    });
    return successResponse(result);
  } catch {
    return errorResponse("Sunucu hatası", 500);
  }
}
