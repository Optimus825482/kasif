import { successResponse, errorResponse } from "@/lib/api-response";
import { SettingsService } from "@/services/settings.service";

export async function GET() {
  try {
    const data = await SettingsService.getPublicSettings();
    return successResponse(data);
  } catch {
    return errorResponse("Sunucu hatası", 500);
  }
}
