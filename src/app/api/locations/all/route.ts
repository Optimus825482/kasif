import { successResponse, errorResponse } from "@/lib/api-response";
import { LocationService } from "@/services/location.service";

export async function GET() {
  try {
    const locations = await LocationService.getAll();
    return successResponse(locations, 200, 60);
  } catch {
    return errorResponse("Sunucu hatası", 500);
  }
}
