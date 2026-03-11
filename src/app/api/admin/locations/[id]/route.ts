import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import fs from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { locationUpdateSchema } from "@/lib/validations";
import { LocationService } from "@/services/location.service";
import { checkAdminApiRateLimit, getClientIp } from "@/lib/rate-limit";

async function writeCoordOverride(
  name: string,
  latitude: number,
  longitude: number,
) {
  try {
    const dir = path.join(process.cwd(), "data");
    const filePath = path.join(dir, "coord-overrides.json");
    let overrides: Record<string, { latitude: number; longitude: number }> = {};
    try {
      const content = await fs.readFile(filePath, "utf-8");
      overrides = JSON.parse(content);
    } catch {
      // file doesn't exist yet
    }
    overrides[name] = { latitude, longitude };
    await fs.writeFile(filePath, JSON.stringify(overrides, null, 2), "utf-8");
  } catch {
    // ignore (e.g. read-only FS in production)
  }
}

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const admin = verifyToken(req);
  if (!admin) return errorResponse("Yetkisiz erişim", 401, "UNAUTHORIZED");

  const rate = checkAdminApiRateLimit(getClientIp(req));
  if (!rate.allowed) {
    return errorResponse("İstek limiti aşıldı", 429, "RATE_LIMIT_EXCEEDED");
  }

  try {
    const { id } = await params;
    const location = await prisma.location.findUnique({
      where: { id, deletedAt: null },
      include: { category: true },
    });

    if (!location)
      return errorResponse("Lokasyon bulunamadı", 404, "NOT_FOUND");
    return successResponse(location);
  } catch (err) {
    console.error("[admin/locations/[id] GET]", err);
    return errorResponse("Lokasyon getirilemedi", 500, "INTERNAL_ERROR");
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const admin = verifyToken(req);
  if (!admin) return errorResponse("Yetkisiz erişim", 401, "UNAUTHORIZED");

  const rate = checkAdminApiRateLimit(getClientIp(req));
  if (!rate.allowed) {
    return errorResponse("İstek limiti aşıldı", 429, "RATE_LIMIT_EXCEEDED");
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = locationUpdateSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Geçersiz veri";
      return errorResponse(msg, 422, "VALIDATION_ERROR");
    }

    const existing = await prisma.location.findUnique({ where: { id } });
    if (!existing)
      return errorResponse("Lokasyon bulunamadı", 404, "NOT_FOUND");

    const location = await LocationService.update(id, parsed.data);

    if (
      parsed.data.latitude != null &&
      parsed.data.longitude != null &&
      location.name
    ) {
      await writeCoordOverride(
        location.name,
        location.latitude,
        location.longitude,
      );
    }

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "UPDATE",
        entity: "Location",
        entityId: id,
        oldValue: existing as object,
        newValue: body,
      },
    });

    revalidateTag("locations");
    revalidateTag(`location-${id}`);
    return successResponse(location);
  } catch (err) {
    console.error("[admin/locations/[id] PUT]", err);
    return errorResponse("Güncelleme hatası", 500, "INTERNAL_ERROR");
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const admin = verifyToken(req);
  if (!admin) return errorResponse("Yetkisiz erişim", 401, "UNAUTHORIZED");

  const rate = checkAdminApiRateLimit(getClientIp(req));
  if (!rate.allowed) {
    return errorResponse("İstek limiti aşıldı", 429, "RATE_LIMIT_EXCEEDED");
  }

  try {
    const { id } = await params;
    await LocationService.softDelete(id);

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "DELETE",
        entity: "Location",
        entityId: id,
      },
    });

    revalidateTag("locations");
    revalidateTag(`location-${id}`);
    return successResponse({ deleted: true });
  } catch (err) {
    console.error("[admin/locations/[id] DELETE]", err);
    return errorResponse("Silme hatası", 500, "INTERNAL_ERROR");
  }
}
