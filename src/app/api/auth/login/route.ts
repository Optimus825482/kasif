import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { comparePassword, signToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { checkLoginRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rate = checkLoginRateLimit(ip);
    if (!rate.allowed) {
      return errorResponse(
        "Çok fazla giriş denemesi. Lütfen daha sonra tekrar deneyin.",
        429,
        "RATE_LIMIT_EXCEEDED",
      );
    }

    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Kullanıcı adı ve şifre gerekli";
      return errorResponse(msg, 422, "VALIDATION_ERROR");
    }
    const { username, password } = parsed.data;

    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin || !admin.isActive)
      return errorResponse("Geçersiz kimlik bilgileri", 401, "INVALID_CREDENTIALS");

    const valid = await comparePassword(password, admin.password);
    if (!valid) return errorResponse("Geçersiz kimlik bilgileri", 401, "INVALID_CREDENTIALS");

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
  } catch (err) {
    console.error("[auth/login]", err);
    return errorResponse("Giriş hatası", 500, "INTERNAL_ERROR");
  }
}
