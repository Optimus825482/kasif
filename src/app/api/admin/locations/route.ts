import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { locationCreateSchema } from "@/lib/validations";
import { LocationService } from "@/services/location.service";
import { checkAdminApiRateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const admin = verifyToken(req);
  if (!admin) return errorResponse("Yetkisiz erişim", 401, "UNAUTHORIZED");

  const ip = getClientIp(req);
  const rate = checkAdminApiRateLimit(ip);
  if (!rate.allowed) {
    return errorResponse("İstek limiti aşıldı", 429, "RATE_LIMIT_EXCEEDED");
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || "";

    const where = {
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { nameEn: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(categoryId && { categoryId }),
    };

    const [items, total] = await Promise.all([
      prisma.location.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, nameEn: true, color: true },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.location.count({ where }),
    ]);

    return successResponse({
      items,
      total,
      page,
      limit,
      pageCount: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("[admin/locations GET]", err);
    return errorResponse("Sunucu hatası", 500, "INTERNAL_ERROR");
  }
}

export async function POST(req: NextRequest) {
  const admin = verifyToken(req);
  if (!admin) return errorResponse("Yetkisiz erişim", 401, "UNAUTHORIZED");

  const ip = getClientIp(req);
  const rate = checkAdminApiRateLimit(ip);
  if (!rate.allowed) {
    return errorResponse("İstek limiti aşıldı", 429, "RATE_LIMIT_EXCEEDED");
  }

  try {
    const body = await req.json();
    const parsed = locationCreateSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Zorunlu alanlar eksik";
      return errorResponse(msg, 422, "VALIDATION_ERROR");
    }

    const location = await LocationService.create(parsed.data);

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "CREATE",
        entity: "Location",
        entityId: location.id,
        newValue: body,
      },
    });

    revalidateTag("locations", "max");
    return successResponse(location, 201);
  } catch (err) {
    console.error("[admin/locations POST]", err);
    return errorResponse("Lokasyon oluşturulamadı", 500, "INTERNAL_ERROR");
  }
}
