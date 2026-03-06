import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { checkAdminApiRateLimit, getClientIp } from "@/lib/rate-limit";
import sharp from "sharp";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  const admin = verifyToken(req);
  if (!admin) return errorResponse("Yetkisiz erişim", 401, "UNAUTHORIZED");

  const rate = checkAdminApiRateLimit(getClientIp(req));
  if (!rate.allowed) {
    return errorResponse("İstek limiti aşıldı", 429, "RATE_LIMIT_EXCEEDED");
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return errorResponse("Dosya gerekli", 422, "VALIDATION_ERROR");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
    ];
    if (!allowedTypes.includes(file.type)) {
      return errorResponse(
        "Sadece JPEG, PNG, WebP ve AVIF formatları desteklenir",
        422,
        "VALIDATION_ERROR",
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return errorResponse("Dosya boyutu 10MB'dan küçük olmalı", 422, "VALIDATION_ERROR");
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Optimize with sharp: resize to max 1200px width, convert to WebP
    const optimized = await sharp(buffer)
      .resize(1200, 900, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const filename = `loc_${timestamp}_${randomStr}.webp`;

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // Write file
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, optimized);

    // Return public URL
    const url = `/uploads/${filename}`;

    return successResponse(
      {
        url,
        originalName: file.name,
        optimizedSize: optimized.length,
        originalSize: file.size,
        savedPercent: Math.round((1 - optimized.length / file.size) * 100),
      },
      201,
    );
  } catch (err) {
    console.error("Upload error:", err);
    return errorResponse("Görsel yüklenemedi", 500, "INTERNAL_ERROR");
  }
}
