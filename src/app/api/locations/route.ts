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

    const result = await LocationService.list({
      page,
      limit,
      search,
      categoryId,
    });
    return successResponse(result);
  } catch {
    return errorResponse("Sunucu hatası", 500);
  }
}
