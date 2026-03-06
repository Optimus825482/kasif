import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    location: {
      findUnique: vi.fn().mockResolvedValue({ id: "loc-1" }),
    },
  },
}));

vi.mock("@/services/analytics.service", () => ({
  AnalyticsService: {
    trackEvent: vi.fn().mockResolvedValue(undefined),
  },
}));

function reqEvents(body: object, ip = "192.168.100.1") {
  return new NextRequest("http://localhost/api/events", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip,
    },
  });
}

describe("POST /api/events", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 201 for valid event body", async () => {
    const req = reqEvents({
      eventType: "detail_view",
      sessionId: "sess-abc",
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data).toEqual({ tracked: true });
  });

  it("returns 201 with optional locationId and metadata", async () => {
    const req = reqEvents({
      eventType: "marker_click",
      sessionId: "sess-xyz",
      locationId: "loc-1",
      metadata: { source: "map" },
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });

  it("returns 422 when eventType is missing", async () => {
    const req = reqEvents({ sessionId: "sess-1" });
    const res = await POST(req);
    expect(res.status).toBe(422);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.errorCode).toBe("VALIDATION_ERROR");
  });

  it("returns 422 when sessionId is missing", async () => {
    const req = reqEvents({ eventType: "click" });
    const res = await POST(req);
    expect(res.status).toBe(422);
    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it("returns 429 when rate limit exceeded (same IP >120/min)", async () => {
    const ip = "10.0.0.200";
    const body = { eventType: "map_view", sessionId: "sess-rate" };
    for (let i = 0; i < 121; i++) {
      const res = await POST(reqEvents(body, ip));
      if (i < 120) expect(res.status).toBe(201);
      else expect(res.status).toBe(429);
    }
    const lastRes = await POST(reqEvents(body, ip));
    expect(lastRes.status).toBe(429);
    const data = await lastRes.json();
    expect(data.errorCode).toBe("RATE_LIMIT_EXCEEDED");
  });
});
