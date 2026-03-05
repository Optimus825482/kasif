import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  const admin = verifyToken(req);
  if (!admin) return errorResponse("Yetkisiz erişim", 401);

  try {
    const [locationCount, categoryCount, eventCount, recentEvents] =
      await Promise.all([
        prisma.location.count({ where: { deletedAt: null } }),
        prisma.category.count({ where: { isActive: true } }),
        prisma.analyticsEvent.count(),
        prisma.analyticsEvent.groupBy({
          by: ["eventType"],
          _count: { id: true },
        }),
      ]);

    return successResponse({
      locationCount,
      categoryCount,
      eventCount,
      recentEvents,
    });
  } catch {
    return errorResponse("Sunucu hatası", 500);
  }
}
