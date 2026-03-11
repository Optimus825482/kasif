import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

function getJwtSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is required.");
  return new TextEncoder().encode(secret);
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Protect /admin routes (except /admin/login): verify JWT in cookie
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = req.cookies.get("admin_token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    try {
      await jwtVerify(token, getJwtSecretKey());
    } catch {
      // Invalid or expired token — clear cookie and redirect
      const res = NextResponse.redirect(new URL("/admin/login", req.url));
      res.cookies.set("admin_token", "", { path: "/", maxAge: 0 });
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
