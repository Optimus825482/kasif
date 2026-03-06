import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { SettingsService } from "@/services/settings.service";

export async function GET(req: NextRequest) {
  const admin = verifyToken(req);
  if (!admin) return errorResponse("Yetkisiz erişim", 401, "UNAUTHORIZED");
  try {
    const notificationRadiusKm = await SettingsService.getNotificationRadiusKm();
    return successResponse({ notificationRadiusKm });
  } catch {
    return errorResponse("Sunucu hatası", 500);
  }
}

export async function PATCH(req: NextRequest) {
  const admin = verifyToken(req);
  if (!admin) return errorResponse("Yetkisiz erişim", 401, "UNAUTHORIZED");
  try {
    const body = await req.json();
    const km = typeof body.notificationRadiusKm === "number"
      ? body.notificationRadiusKm
      : Number(body.notificationRadiusKm);
    if (!Number.isFinite(km) || km < 1 || km > 500) {
      return errorResponse("Geçersiz mesafe (1–500 km)", 400);
    }
    const notificationRadiusKm = await SettingsService.setNotificationRadiusKm(km);
    return successResponse({ notificationRadiusKm });
  } catch {
    return errorResponse("Sunucu hatası", 500);
  }
}
