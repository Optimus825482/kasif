import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { LocationService } from "@/services/location.service";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const location = await LocationService.getById(id);
    if (!location) return errorResponse("Lokasyon bulunamadı", 404);
    return successResponse(location);
  } catch {
    return errorResponse("Sunucu hatası", 500);
  }
}
