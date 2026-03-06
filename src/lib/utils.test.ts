import { describe, it, expect } from "vitest";
import { haversineDistance, formatDistance } from "./utils";

describe("utils", () => {
  describe("haversineDistance", () => {
    it("returns 0 for same point", () => {
      const d = haversineDistance(39.65, 27.88, 39.65, 27.88);
      expect(d).toBe(0);
    });

    it("returns positive distance for two distinct points", () => {
      const d = haversineDistance(39.65, 27.88, 39.66, 27.89);
      expect(d).toBeGreaterThan(0);
      expect(d).toBeLessThan(5000);
    });

    it("returns ~111km per degree latitude at equator (approx)", () => {
      const d = haversineDistance(0, 0, 1, 0);
      expect(d).toBeGreaterThan(110000);
      expect(d).toBeLessThan(112000);
    });

    it("is symmetric", () => {
      const d1 = haversineDistance(39.1, 27.0, 40.2, 28.1);
      const d2 = haversineDistance(40.2, 28.1, 39.1, 27.0);
      expect(d1).toBe(d2);
    });

    it("handles negative coordinates (south/west)", () => {
      const d = haversineDistance(-33.87, 18.42, -33.88, 18.43);
      expect(d).toBeGreaterThan(0);
      expect(d).toBeLessThan(2000);
    });
  });

  describe("formatDistance", () => {
    it("formats meters when < 1000", () => {
      expect(formatDistance(0)).toBe("0 m");
      expect(formatDistance(500)).toBe("500 m");
      expect(formatDistance(999)).toBe("999 m");
    });

    it("formats kilometers when >= 1000", () => {
      expect(formatDistance(1000)).toBe("1.0 km");
      expect(formatDistance(5500)).toBe("5.5 km");
      expect(formatDistance(12345)).toBe("12.3 km");
    });

    it("rounds meters to integer", () => {
      expect(formatDistance(100.4)).toBe("100 m");
      expect(formatDistance(100.6)).toBe("101 m");
    });
  });
});
