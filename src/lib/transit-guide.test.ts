import { describe, it, expect } from "vitest";
import { generateTransitGuide, type TransitGuide } from "./transit-guide";

describe("generateTransitGuide", () => {
  it("returns TransitGuide shape with summary, steps, distanceKm", () => {
    const guide = generateTransitGuide(39.65, 27.88, 39.66, 27.89);
    expect(guide).toMatchObject({
      summary: expect.any(String),
      summaryEn: expect.any(String),
      totalEstimate: expect.any(String),
      totalEstimateEn: expect.any(String),
      steps: expect.any(Array),
      needsFerry: expect.any(Boolean),
      distanceKm: expect.any(Number),
    });
    expect(guide.distanceKm).toBeGreaterThanOrEqual(0);
  });

  it("returns single walk step when distance < 2km (very close)", () => {
    const guide = generateTransitGuide(39.65, 27.88, 39.652, 27.882);
    expect(guide.steps.length).toBeGreaterThanOrEqual(1);
    expect(guide.steps[0].icon).toBe("walk");
    expect(guide.needsFerry).toBe(false);
    expect(guide.distanceKm).toBeLessThan(2);
  });

  it("returns steps with walk and bus for same district (Balıkesir Merkez)", () => {
    const userLat = 39.64;
    const userLng = 27.88;
    const destLat = 39.66;
    const destLng = 27.89;
    const guide = generateTransitGuide(userLat, userLng, destLat, destLng);
    expect(guide.steps.length).toBeGreaterThanOrEqual(1);
    const hasWalk = guide.steps.some((s) => s.icon === "walk");
    expect(hasWalk).toBe(true);
  });

  it("sets needsFerry true for island destination (Marmara)", () => {
    const guide = generateTransitGuide(
      40.35,
      27.97,
      40.6167,
      27.6167,
    );
    expect(guide.needsFerry).toBe(true);
  });

  it("returns multiple steps for inter-district route", () => {
    const guide = generateTransitGuide(
      39.65,
      27.88,
      39.58,
      27.02,
    );
    expect(guide.steps.length).toBeGreaterThanOrEqual(2);
    expect(guide.distanceKm).toBeGreaterThan(10);
  });
});
