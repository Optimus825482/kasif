import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { comparePassword, signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password)
      return errorResponse("Kullanıcı adı ve şifre gerekli", 422);

    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin || !admin.isActive)
      return errorResponse("Geçersiz kimlik bilgileri", 401);

    const valid = await comparePassword(password, admin.password);
    if (!valid) return errorResponse("Geçersiz kimlik bilgileri", 401);

    const token = signToken({
      id: admin.id,
      email: admin.email || "",
      role: admin.role,
    });
    return successResponse({
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        username: admin.username,
        role: admin.role,
      },
    });
  } catch {
    return errorResponse("Giriş hatası", 500);
  }
}
