import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { AnalyticsService } from "@/services/analytics.service";

export async function GET(req: NextRequest) {
  const admin = verifyToken(req);
  if (!admin) return errorResponse("Yetkisiz erişim", 401, "UNAUTHORIZED");

  try {
    const stats = await AnalyticsService.getDashboardStats();
    return successResponse(stats);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return errorResponse("Sunucu hatası", 500, "INTERNAL_ERROR");
  }
}
