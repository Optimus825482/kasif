import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

const mockComparePassword = vi.fn();
const mockSignToken = vi.fn();

vi.mock("@/lib/auth", () => ({
  comparePassword: (...args: unknown[]) => mockComparePassword(...args),
  signToken: (...args: unknown[]) => mockSignToken(...args),
}));

const mockAdmin = {
  id: "admin-1",
  username: "admin",
  email: "admin@test.local",
  password: "hashed",
  name: "Admin",
  role: "ADMIN",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

vi.mock("@/lib/prisma", () => ({
  prisma: {
    admin: {
      findUnique: vi.fn(),
    },
  },
}));

async function getPrismaMock() {
  const { prisma } = await import("@/lib/prisma");
  return prisma as { admin: { findUnique: ReturnType<typeof vi.fn> } };
}

function reqLogin(body: object, ip = "192.168.101.10") {
  return new NextRequest("http://localhost/api/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip,
    },
  });
}

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockSignToken.mockReturnValue("fake-jwt-token");
    const prisma = await getPrismaMock();
    prisma.admin.findUnique.mockResolvedValue(mockAdmin);
    mockComparePassword.mockResolvedValue(true);
  });

  it("returns 200 and token for valid credentials", async () => {
    const req = reqLogin({ username: "admin", password: "valid" }, "192.168.101.1");
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.token).toBe("fake-jwt-token");
    expect(data.data.admin).toMatchObject({
      id: "admin-1",
      name: "Admin",
      username: "admin",
      role: "ADMIN",
    });
  });

  it("returns 401 for wrong password", async () => {
    mockComparePassword.mockResolvedValue(false);
    const req = reqLogin({ username: "admin", password: "wrong" }, "192.168.101.2");
    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.errorCode).toBe("INVALID_CREDENTIALS");
  });

  it("returns 401 for unknown username", async () => {
    const prisma = await getPrismaMock();
    prisma.admin.findUnique.mockResolvedValue(null);
    const req = reqLogin({ username: "nobody", password: "x" }, "192.168.101.3");
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 401 when admin is inactive", async () => {
    const prisma = await getPrismaMock();
    prisma.admin.findUnique.mockResolvedValue({
      ...mockAdmin,
      isActive: false,
    });
    const req = reqLogin({ username: "admin", password: "valid" }, "192.168.101.4");
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 422 when username is missing", async () => {
    const req = reqLogin({ password: "secret" }, "192.168.101.5");
    const res = await POST(req);
    expect(res.status).toBe(422);
    const data = await res.json();
    expect(data.errorCode).toBe("VALIDATION_ERROR");
  });

  it("returns 422 when password is missing", async () => {
    const req = reqLogin({ username: "admin" }, "192.168.101.6");
    const res = await POST(req);
    expect(res.status).toBe(422);
  });

  it("returns 429 when login rate limit exceeded (same IP >5/min)", async () => {
    const ip = "10.0.0.201";
    const body = { username: "admin", password: "wrong" };
    const prisma = await getPrismaMock();
    prisma.admin.findUnique.mockResolvedValue(mockAdmin);
    mockComparePassword.mockResolvedValue(false);

    for (let i = 0; i < 6; i++) {
      const res = await POST(reqLogin(body, ip));
      if (i < 5) expect(res.status).toBe(401);
      else expect(res.status).toBe(429);
    }
    const lastRes = await POST(reqLogin(body, ip));
    expect(lastRes.status).toBe(429);
    const data = await lastRes.json();
    expect(data.errorCode).toBe("RATE_LIMIT_EXCEEDED");
  });
});
