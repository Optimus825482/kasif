import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { buildPagination } from "@/lib/pagination";
import type { LocationCreateInput, LocationUpdateInput } from "@/lib/validations";

const CACHE_TAG_LOCATIONS = "locations";
const CACHE_SECONDS = 60; // 1 minute

export class LocationService {
  static async list(params: {
    page: number;
    limit: number;
    search?: string;
    categoryId?: string;
  }) {
    const { page, limit, search, categoryId } = params;
    const where = {
      deletedAt: null,
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { nameEn: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(categoryId && { categoryId }),
    };

    const [items, total] = await Promise.all([
      prisma.location.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              nameEn: true,
              icon: true,
              color: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.location.count({ where }),
    ]);

    return { items, pagination: buildPagination(page, limit, total) };
  }

  static async getAll() {
    return unstable_cache(
      async () =>
        prisma.location.findMany({
          where: { deletedAt: null, isActive: true },
          include: {
            category: {
              select: {
                id: true,
                name: true,
                nameEn: true,
                icon: true,
                color: true,
                slug: true,
              },
            },
          },
          orderBy: { name: "asc" },
        }),
      [CACHE_TAG_LOCATIONS],
      { revalidate: CACHE_SECONDS, tags: [CACHE_TAG_LOCATIONS] },
    )();
  }

  static async getById(id: string) {
    return unstable_cache(
      async () =>
        prisma.location.findFirst({
          where: { id, deletedAt: null },
          include: { category: true },
        }),
      [`location-${id}`],
      { revalidate: CACHE_SECONDS, tags: [CACHE_TAG_LOCATIONS, `location-${id}`] },
    )();
  }

  static async getFeatured() {
    return prisma.location.findMany({
      where: { deletedAt: null, isActive: true, isFeatured: true },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            icon: true,
            color: true,
          },
        },
      },
      take: 6,
    });
  }

  static async create(data: LocationCreateInput) {
    const created = await prisma.location.create({
      data: {
        name: data.name,
        nameEn: data.nameEn,
        description: data.description,
        descriptionEn: data.descriptionEn,
        shortDesc: data.shortDesc ?? "",
        shortDescEn: data.shortDescEn ?? "",
        latitude: data.latitude,
        longitude: data.longitude,
        categoryId: data.categoryId,
        images: data.images ?? [],
        visitHours: data.visitHours ?? null,
        fee: data.fee ?? null,
        feeEn: data.feeEn ?? null,
        address: data.address ?? null,
        addressEn: data.addressEn ?? null,
        phone: data.phone ?? null,
        website: data.website || null,
        accessibility: data.accessibility ?? null,
        publicTransport: data.publicTransport ?? null,
        publicTransportEn: data.publicTransportEn ?? null,
        isFeatured: data.isFeatured ?? false,
      },
    });
    return created;
  }

  static async update(id: string, data: LocationUpdateInput) {
    const payload: Parameters<typeof prisma.location.update>[0]["data"] = {};
    if (data.name != null) payload.name = data.name;
    if (data.nameEn != null) payload.nameEn = data.nameEn;
    if (data.description != null) payload.description = data.description;
    if (data.descriptionEn != null) payload.descriptionEn = data.descriptionEn;
    if (data.shortDesc !== undefined) payload.shortDesc = data.shortDesc;
    if (data.shortDescEn !== undefined) payload.shortDescEn = data.shortDescEn;
    if (data.latitude != null) payload.latitude = data.latitude;
    if (data.longitude != null) payload.longitude = data.longitude;
    if (data.categoryId != null) payload.categoryId = data.categoryId;
    if (data.images !== undefined) payload.images = data.images;
    if (data.visitHours !== undefined) payload.visitHours = data.visitHours;
    if (data.fee !== undefined) payload.fee = data.fee;
    if (data.feeEn !== undefined) payload.feeEn = data.feeEn;
    if (data.address !== undefined) payload.address = data.address;
    if (data.addressEn !== undefined) payload.addressEn = data.addressEn;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.website !== undefined) payload.website = data.website || null;
    if (data.accessibility !== undefined) payload.accessibility = data.accessibility;
    if (data.publicTransport !== undefined) payload.publicTransport = data.publicTransport;
    if (data.publicTransportEn !== undefined) payload.publicTransportEn = data.publicTransportEn;
    if (data.isActive !== undefined) payload.isActive = data.isActive;
    if (data.isFeatured !== undefined) payload.isFeatured = data.isFeatured;
    return prisma.location.update({ where: { id }, data: payload });
  }

  static async softDelete(id: string) {
    return prisma.location.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
