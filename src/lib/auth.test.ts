import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  signToken,
  comparePassword,
  hashPassword,
  verifyToken,
  type TokenPayload,
} from "./auth";
import { NextRequest } from "next/server";

const mockCompare = vi.fn();
const mockHash = vi.fn();

vi.mock("bcryptjs", () => ({
  default: {
    compare: (...args: unknown[]) => mockCompare(...args),
    hash: (...args: unknown[]) => mockHash(...args),
  },
}));

describe("auth", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    process.env.NODE_ENV = "test";
    delete process.env.JWT_SECRET;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("signToken", () => {
    it("returns a JWT string for valid payload", () => {
      const payload: TokenPayload = {
        id: "user-1",
        email: "admin@test.local",
        role: "ADMIN",
      };
      const token = signToken(payload);
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3);
    });

    it("produces token verifiable with verifyToken", () => {
      const payload: TokenPayload = {
        id: "user-2",
        email: "a@b.co",
        role: "EDITOR",
      };
      const token = signToken(payload);
      const req = new NextRequest("http://localhost", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const decoded = verifyToken(req);
      expect(decoded).not.toBeNull();
      expect(decoded!.id).toBe(payload.id);
      expect(decoded!.email).toBe(payload.email);
      expect(decoded!.role).toBe(payload.role);
    });
  });

  describe("verifyToken", () => {
    it("returns null when no Authorization header", () => {
      const req = new NextRequest("http://localhost");
      expect(verifyToken(req)).toBeNull();
    });

    it("returns null when Authorization is not Bearer", () => {
      const req = new NextRequest("http://localhost", {
        headers: { Authorization: "Basic xyz" },
      });
      expect(verifyToken(req)).toBeNull();
    });

    it("returns null for invalid or malformed token", () => {
      const req = new NextRequest("http://localhost", {
        headers: { Authorization: "Bearer invalid.jwt.here" },
      });
      expect(verifyToken(req)).toBeNull();
    });
  });

  describe("comparePassword", () => {
    it("returns true when bcrypt.compare returns true", async () => {
      mockCompare.mockResolvedValue(true);
      const result = await comparePassword("plain", "hash");
      expect(result).toBe(true);
      expect(mockCompare).toHaveBeenCalledWith("plain", "hash");
    });

    it("returns false when bcrypt.compare returns false", async () => {
      mockCompare.mockResolvedValue(false);
      const result = await comparePassword("wrong", "hash");
      expect(result).toBe(false);
    });
  });

  describe("hashPassword", () => {
    it("returns hash from bcrypt.hash", async () => {
      mockHash.mockResolvedValue("$2a$12$hashed");
      const result = await hashPassword("secret");
      expect(result).toBe("$2a$12$hashed");
      expect(mockHash).toHaveBeenCalledWith("secret", 12);
    });
  });

  describe("getJwtSecret (production)", () => {
    it("throws when NODE_ENV is production and JWT_SECRET is not set", async () => {
      process.env.NODE_ENV = "production";
      delete process.env.JWT_SECRET;
      const { signToken: sign } = await import("./auth");
      expect(() =>
        sign({ id: "x", email: "e@e.com", role: "ADMIN" }),
      ).toThrow("JWT_SECRET is required in production");
    });

    it("does not throw when NODE_ENV is production and JWT_SECRET is set", async () => {
      process.env.NODE_ENV = "production";
      process.env.JWT_SECRET = "test-secret";
      const { signToken: sign } = await import("./auth");
      expect(() =>
        sign({ id: "x", email: "e@e.com", role: "ADMIN" }),
      ).not.toThrow();
    });
  });
});
