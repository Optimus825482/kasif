import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const admin = verifyToken(req);
  if (!admin) return errorResponse("Yetkisiz erişim", 401);

  try {
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.location.findUnique({ where: { id } });
    if (!existing) return errorResponse("Lokasyon bulunamadı", 404);

    const location = await prisma.location.update({
      where: { id },
      data: {
        ...body,
        latitude: body.latitude ? Number(body.latitude) : undefined,
        longitude: body.longitude ? Number(body.longitude) : undefined,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "UPDATE",
        entity: "Location",
        entityId: id,
        oldValue: existing as any,
        newValue: body,
      },
    });

    return successResponse(location);
  } catch {
    return errorResponse("Güncelleme hatası", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const admin = verifyToken(req);
  if (!admin) return errorResponse("Yetkisiz erişim", 401);

  try {
    const { id } = await params;
    await prisma.location.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "DELETE",
        entity: "Location",
        entityId: id,
      },
    });

    return successResponse({ deleted: true });
  } catch {
    return errorResponse("Silme hatası", 500);
  }
}
