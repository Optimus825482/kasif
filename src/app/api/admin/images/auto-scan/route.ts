import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { findImageForLocation } from "@/services/image-finder.service";

/**
 * GET /api/admin/images/auto-scan
 * Server-Sent Events endpoint.
 * Görselsiz lokasyonları sırayla tarar, her sonucu SSE olarak stream eder.
 */
export async function GET(req: NextRequest) {
  const admin = verifyToken(req);
  if (!admin) {
    return new Response("Unauthorized", { status: 401 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      };

      try {
        // Görselsiz lokasyonları al
        const locations = await prisma.location.findMany({
          where: {
            deletedAt: null,
            isActive: true,
            images: { equals: [] },
          },
          include: {
            category: { select: { id: true, name: true, color: true } },
          },
          orderBy: { name: "asc" },
        });

        send("start", {
          total: locations.length,
          message: `${locations.length} görselsiz kayıt tespit edildi.`,
        });

        let found = 0;
        let notFound = 0;

        for (let i = 0; i < locations.length; i++) {
          const loc = locations[i];

          send("progress", {
            index: i,
            total: locations.length,
            locationId: loc.id,
            locationName: loc.name,
            category: loc.category.name,
            status: "searching",
          });

          const result = await findImageForLocation(loc.name, loc.nameEn);

          if (result) {
            found++;
            send("found", {
              index: i,
              total: locations.length,
              locationId: loc.id,
              locationName: loc.name,
              locationNameEn: loc.nameEn,
              category: loc.category.name,
              categoryColor: loc.category.color,
              imageUrl: result.imageUrl,
              thumbUrl: result.thumbUrl,
              originalUrl: result.originalUrl,
              source: result.source,
              strategy: result.strategy,
              stats: { found, notFound, processed: i + 1 },
            });
          } else {
            notFound++;
            send("not-found", {
              index: i,
              total: locations.length,
              locationId: loc.id,
              locationName: loc.name,
              locationNameEn: loc.nameEn,
              category: loc.category.name,
              categoryColor: loc.category.color,
              stats: { found, notFound, processed: i + 1 },
            });
          }
        }

        send("complete", {
          total: locations.length,
          found,
          notFound,
          message: `Tarama tamamlandı. ${found} görsel bulundu, ${notFound} bulunamadı.`,
        });
      } catch (err) {
        send("error", {
          message: err instanceof Error ? err.message : "Bilinmeyen hata",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
