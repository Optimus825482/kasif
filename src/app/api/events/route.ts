import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { AnalyticsService } from "@/services/analytics.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventType, locationId, sessionId, metadata } = body;
    if (!eventType || !sessionId)
      return errorResponse("eventType ve sessionId gerekli", 422);

    // Validate locationId exists before inserting (prevent FK violation)
    let validLocationId = locationId || null;
    if (validLocationId) {
      const { prisma } = await import("@/lib/prisma");
      const exists = await prisma.location.findUnique({
        where: { id: validLocationId },
        select: { id: true },
      });
      if (!exists) validLocationId = null;
    }

    await AnalyticsService.trackEvent({
      eventType,
      locationId: validLocationId,
      sessionId,
      metadata,
    });
    return successResponse({ tracked: true }, 201);
  } catch {
    return errorResponse("Olay kaydedilemedi", 500);
  }
}
