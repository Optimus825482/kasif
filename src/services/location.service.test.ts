import { describe, it, expect, vi, beforeEach } from "vitest";
import { LocationService } from "./location.service";

const mockFindMany = vi.fn();
const mockCount = vi.fn();
const mockFindFirst = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    location: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      count: (...args: unknown[]) => mockCount(...args),
    },
  },
}));

vi.mock("next/cache", () => ({
  unstable_cache: (fn: () => Promise<unknown>) => fn,
}));

const mockLocation = (id: string, lat: number, lng: number) => ({
  id,
  name: `Location ${id}`,
  nameEn: `Location ${id} En`,
  latitude: lat,
  longitude: lng,
  categoryId: "cat-1",
  category: {
    id: "cat-1",
    name: "Müze",
    nameEn: "Museum",
    icon: "",
    color: "#333",
  },
  deletedAt: null,
  isActive: true,
  isFeatured: false,
  images: [],
  description: null,
  descriptionEn: null,
  shortDesc: null,
  shortDescEn: null,
  visitHours: null,
  fee: null,
  feeEn: null,
  address: null,
  addressEn: null,
  phone: null,
  website: null,
  accessibility: null,
  publicTransport: null,
  publicTransportEn: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe("LocationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list (nearby)", () => {
    it("filters by radius and returns items with pagination", async () => {
      const locs = [
        mockLocation("loc-1", 39.65, 27.88),
        mockLocation("loc-2", 39.66, 27.89),
      ];
      mockFindMany.mockResolvedValue(locs);

      const result = await LocationService.list({
        page: 1,
        limit: 10,
        latitude: 39.65,
        longitude: 27.88,
        radiusKm: 20,
      });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            latitude: { gte: expect.any(Number), lte: expect.any(Number) },
            longitude: { gte: expect.any(Number), lte: expect.any(Number) },
            deletedAt: null,
            isActive: true,
          }),
        }),
      );
      expect(result.items).toHaveLength(2);
      expect(result.pagination).toBeDefined();
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.total).toBe(2);
    });

    it("applies excludeId in nearby mode", async () => {
      mockFindMany.mockResolvedValue([]);

      await LocationService.list({
        page: 1,
        limit: 5,
        latitude: 39.65,
        longitude: 27.88,
        radiusKm: 15,
        excludeId: "loc-exclude",
      });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: { not: "loc-exclude" },
          }),
        }),
      );
    });
  });

  describe("list (non-nearby)", () => {
    it("calls findMany and count with search and categoryId", async () => {
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      await LocationService.list({
        page: 2,
        limit: 20,
        search: "müze",
        categoryId: "cat-1",
      });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categoryId: "cat-1",
            OR: expect.any(Array),
          }),
          skip: 20,
          take: 20,
        }),
      );
      expect(mockCount).toHaveBeenCalled();
    });
  });

  describe("getById", () => {
    it("returns location when found", async () => {
      const loc = mockLocation("loc-99", 39.7, 27.9);
      mockFindFirst.mockResolvedValue(loc);

      const result = await LocationService.getById("loc-99");

      expect(result).toEqual(loc);
      expect(mockFindFirst).toHaveBeenCalledWith({
        where: { id: "loc-99", deletedAt: null },
        include: { category: true },
      });
    });

    it("returns null when not found", async () => {
      mockFindFirst.mockResolvedValue(null);

      const result = await LocationService.getById("nonexistent");

      expect(result).toBeNull();
    });
  });
});
