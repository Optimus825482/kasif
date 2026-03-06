import { describe, it, expect } from "vitest";
import {
  loginSchema,
  eventSchema,
  locationCreateSchema,
  locationUpdateSchema,
} from "./validations";

describe("loginSchema", () => {
  it("accepts valid username and password", () => {
    const result = loginSchema.safeParse({ username: "admin", password: "secret" });
    expect(result.success).toBe(true);
  });

  it("rejects empty username", () => {
    const result = loginSchema.safeParse({ username: "", password: "x" });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({ username: "a", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("eventSchema", () => {
  it("accepts valid event", () => {
    const result = eventSchema.safeParse({
      eventType: "detail_view",
      sessionId: "sess-1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing eventType", () => {
    const result = eventSchema.safeParse({ sessionId: "sess-1" });
    expect(result.success).toBe(false);
  });

  it("rejects missing sessionId", () => {
    const result = eventSchema.safeParse({ eventType: "click" });
    expect(result.success).toBe(false);
  });
});

describe("locationCreateSchema", () => {
  const valid = {
    name: "Test",
    nameEn: "Test En",
    description: "Desc",
    descriptionEn: "Desc En",
    latitude: 39.6,
    longitude: 27.8,
    categoryId: "cat-1",
  };

  it("accepts minimal valid input", () => {
    const result = locationCreateSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("coerces string latitude/longitude to number", () => {
    const result = locationCreateSchema.safeParse({
      ...valid,
      latitude: "39.6",
      longitude: "27.8",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.latitude).toBe(39.6);
      expect(result.data.longitude).toBe(27.8);
    }
  });
});

describe("locationUpdateSchema", () => {
  it("accepts partial update", () => {
    const result = locationUpdateSchema.safeParse({ name: "New Name" });
    expect(result.success).toBe(true);
  });
});
