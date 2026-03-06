import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  const admin = verifyToken(req);
  if (!admin) return errorResponse("Yetkisiz erişim", 401);

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
  } catch {
    return errorResponse("Sunucu hatası", 500);
  }
}

export async function POST(req: NextRequest) {
  const admin = verifyToken(req);
  if (!admin) return errorResponse("Yetkisiz erişim", 401);

  try {
    const body = await req.json();
    const {
      name,
      nameEn,
      description,
      descriptionEn,
      shortDesc,
      shortDescEn,
      latitude,
      longitude,
      categoryId,
      images,
      visitHours,
      fee,
      feeEn,
      address,
      addressEn,
      phone,
      website,
      accessibility,
      isFeatured,
    } = body;

    if (
      !name ||
      !nameEn ||
      !description ||
      !descriptionEn ||
      !latitude ||
      !longitude ||
      !categoryId
    ) {
      return errorResponse("Zorunlu alanlar eksik", 422);
    }

    const location = await prisma.location.create({
      data: {
        name,
        nameEn,
        description,
        descriptionEn,
        shortDesc: shortDesc || "",
        shortDescEn: shortDescEn || "",
        latitude: Number(latitude),
        longitude: Number(longitude),
        categoryId,
        images: images || [],
        visitHours,
        fee,
        feeEn,
        address,
        addressEn,
        phone,
        website,
        accessibility,
        isFeatured: isFeatured || false,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "CREATE",
        entity: "Location",
        entityId: location.id,
        newValue: body,
      },
    });

    return successResponse(location, 201);
  } catch {
    return errorResponse("Lokasyon oluşturulamadı", 500);
  }
}
