import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { AnalyticsService } from "@/services/analytics.service";
import { eventSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = eventSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "eventType ve sessionId gerekli";
      return errorResponse(msg, 422, "VALIDATION_ERROR");
    }
    let { eventType, locationId, sessionId, metadata } = parsed.data;

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
      locationId: validLocationId ?? undefined,
      sessionId,
      metadata: metadata ?? undefined,
    });
    return successResponse({ tracked: true }, 201);
  } catch (err) {
    console.error("[events]", err);
    return errorResponse("Olay kaydedilemedi", 500, "INTERNAL_ERROR");
  }
}
