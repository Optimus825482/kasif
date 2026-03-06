import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";

const mockList = vi.fn();

vi.mock("@/services/location.service", () => ({
  LocationService: {
    list: (...args: unknown[]) => mockList(...args),
  },
}));

const defaultListResult = {
  items: [],
  total: 0,
  page: 1,
  pageCount: 0,
};

function reqLocations(params: Record<string, string> = {}) {
  const search = new URLSearchParams(params).toString();
  const url = `http://localhost/api/locations${search ? `?${search}` : ""}`;
  return new NextRequest(url, { method: "GET" });
}

describe("GET /api/locations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockList.mockResolvedValue(defaultListResult);
  });

  it("returns 200 and list result with default params", async () => {
    const req = reqLocations();
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data).toEqual(defaultListResult);
    expect(mockList).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        limit: 50,
        search: "",
      }),
    );
  });

  it("passes page and limit from query", async () => {
    const req = reqLocations({ page: "2", limit: "10" });
    await GET(req);
    expect(mockList).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2,
        limit: 10,
      }),
    );
  });

  it("passes search and categoryId", async () => {
    const req = reqLocations({
      search: "müze",
      categoryId: "cat-123",
    });
    await GET(req);
    expect(mockList).toHaveBeenCalledWith(
      expect.objectContaining({
        search: "müze",
        categoryId: "cat-123",
      }),
    );
  });

  it("passes latitude, longitude, radiusKm and excludeId for nearby query", async () => {
    const req = reqLocations({
      latitude: "39.65",
      longitude: "27.88",
      radiusKm: "20",
      excludeId: "loc-999",
    });
    await GET(req);
    expect(mockList).toHaveBeenCalledWith(
      expect.objectContaining({
        latitude: 39.65,
        longitude: 27.88,
        radiusKm: 20,
        excludeId: "loc-999",
      }),
    );
  });

  it("returns 200 with items when service returns data", async () => {
    const items = [
      {
        id: "loc-1",
        name: "Test Place",
        nameEn: "Test Place En",
        latitude: 39.6,
        longitude: 27.9,
        categoryId: "cat-1",
        category: { id: "cat-1", name: "Müze", nameEn: "Museum", icon: "", color: "#333" },
        images: [],
        isActive: true,
        isFeatured: false,
      },
    ];
    mockList.mockResolvedValue({
      items,
      total: 1,
      page: 1,
      pageCount: 1,
    });
    const req = reqLocations();
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.items).toHaveLength(1);
    expect(data.data.items[0].name).toBe("Test Place");
    expect(data.data.total).toBe(1);
  });
});
