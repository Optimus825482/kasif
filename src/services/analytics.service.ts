import { prisma } from "@/lib/prisma";

// Types for raw query results
interface DailyTrend {
  date: Date;
  count: number;
}

interface TopLocationRow {
  name: string;
  nameEn: string | null;
  categoryName: string;
  categoryColor: string;
  count: number;
}

interface CategoryStat {
  name: string;
  nameEn: string | null;
  color: string;
  count: number;
}

interface UniqueSessionCount {
  count: number;
}

export class AnalyticsService {
  static async trackEvent(data: {
    eventType: string;
    locationId?: string;
    sessionId: string;
    metadata?: Record<string, unknown>;
  }) {
    return prisma.analyticsEvent.create({ data });
  }

  static async getDashboardStats() {
    const [
      totalLocations,
      totalCategories,
      totalEvents,
      uniqueSessionsResult,
      dailyTrends,
      topLocations,
      eventsByType,
      categoryStats,
      recentEvents,
    ] = await Promise.all([
      // Total active locations
      prisma.location.count({ where: { deletedAt: null } }),

      // Total active categories
      prisma.category.count(),

      // Total analytics events
      prisma.analyticsEvent.count(),

      // Unique sessions
      prisma.$queryRaw<UniqueSessionCount[]>`
        SELECT COUNT(DISTINCT "sessionId")::int as count
        FROM "AnalyticsEvent"
      `,

      // Daily trends - last 30 days
      prisma.$queryRaw<DailyTrend[]>`
        SELECT DATE("createdAt") as date, COUNT(*)::int as count
        FROM "AnalyticsEvent"
        WHERE "createdAt" >= NOW() - INTERVAL '30 days'
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `,

      // Top 10 locations by event count with details
      prisma.$queryRaw<TopLocationRow[]>`
        SELECT
          l.name,
          l."nameEn",
          c.name as "categoryName",
          c.color as "categoryColor",
          COUNT(ae.id)::int as count
        FROM "AnalyticsEvent" ae
        JOIN "Location" l ON ae."locationId" = l.id
        JOIN "Category" c ON l."categoryId" = c.id
        WHERE ae."locationId" IS NOT NULL
        GROUP BY l.id, l.name, l."nameEn", c.name, c.color
        ORDER BY count DESC
        LIMIT 10
      `,

      // Events grouped by type
      prisma.analyticsEvent.groupBy({
        by: ["eventType"],
        _count: { id: true },
      }),

      // Events per category
      prisma.$queryRaw<CategoryStat[]>`
        SELECT
          c.name,
          c."nameEn",
          c.color,
          COUNT(ae.id)::int as count
        FROM "AnalyticsEvent" ae
        JOIN "Location" l ON ae."locationId" = l.id
        JOIN "Category" c ON l."categoryId" = c.id
        WHERE ae."locationId" IS NOT NULL
        GROUP BY c.id, c.name, c."nameEn", c.color
        ORDER BY count DESC
      `,

      // Recent 20 events with location name
      prisma.analyticsEvent.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        include: {
          location: {
            select: { name: true, nameEn: true },
          },
        },
      }),
    ]);

    return {
      totalLocations,
      totalCategories,
      totalEvents,
      uniqueSessions: uniqueSessionsResult[0]?.count ?? 0,
      dailyTrends,
      topLocations,
      eventsByType,
      categoryStats,
      recentEvents,
    };
  }
}
