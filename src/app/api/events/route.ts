import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { AnalyticsService } from "@/services/analytics.service";
import { eventSchema } from "@/lib/validations";
import { checkEventsRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rate = checkEventsRateLimit(ip);
    if (!rate.allowed) {
      const retrySec = rate.retryAfterMs
        ? Math.ceil(rate.retryAfterMs / 1000)
        : 60;
      return errorResponse(
        `Çok fazla istek. ${retrySec} saniye sonra tekrar deneyin.`,
        429,
        "RATE_LIMIT_EXCEEDED",
      );
    }

    const body = await req.json();
    const parsed = eventSchema.safeParse(body);
    if (!parsed.success) {
      const msg =
        parsed.error.issues[0]?.message ?? "eventType ve sessionId gerekli";
      return errorResponse(msg, 422, "VALIDATION_ERROR");
    }
    let { eventType, locationId, sessionId, metadata } = parsed.data;

    let validLocationId = locationId || null;
    if (validLocationId) {
      const exists = await (
        await import("@/lib/prisma")
      ).prisma.location.findUnique({
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
