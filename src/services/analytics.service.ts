import { prisma } from "@/lib/prisma";

export class AnalyticsService {
  static async trackEvent(data: {
    eventType: string;
    locationId?: string;
    sessionId: string;
    metadata?: any;
  }) {
    return prisma.analyticsEvent.create({ data });
  }

  static async getStats() {
    const [totalEvents, topLocations, eventsByType] = await Promise.all([
      prisma.analyticsEvent.count(),
      prisma.analyticsEvent.groupBy({
        by: ["locationId"],
        _count: { id: true },
        where: { locationId: { not: null } },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),
      prisma.analyticsEvent.groupBy({
        by: ["eventType"],
        _count: { id: true },
      }),
    ]);
    return { totalEvents, topLocations, eventsByType };
  }
}
