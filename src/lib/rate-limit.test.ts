import { describe, it, expect } from "vitest";
import { checkLoginRateLimit, checkAdminApiRateLimit } from "./rate-limit";

describe("checkLoginRateLimit", () => {
  it("allows first requests under limit", () => {
    const ip = "192.168.1.1";
    for (let i = 0; i < 5; i++) {
      const r = checkLoginRateLimit(ip);
      expect(r.allowed).toBe(true);
    }
  });

  it("denies over limit", () => {
    const ip = "10.0.0.99";
    for (let i = 0; i < 6; i++) checkLoginRateLimit(ip);
    const r = checkLoginRateLimit(ip);
    expect(r.allowed).toBe(false);
    expect(r.retryAfterMs).toBeDefined();
  });
});

describe("checkAdminApiRateLimit", () => {
  it("allows requests under limit", () => {
    const ip = "172.16.0.1";
    const r = checkAdminApiRateLimit(ip);
    expect(r.allowed).toBe(true);
  });
});
