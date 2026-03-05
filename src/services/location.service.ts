import { prisma } from "@/lib/prisma";
import { buildPagination } from "@/lib/pagination";

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
    return prisma.location.findMany({
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
    });
  }

  static async getById(id: string) {
    return prisma.location.findFirst({
      where: { id, deletedAt: null },
      include: { category: true },
    });
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

  static async create(data: any) {
    return prisma.location.create({ data });
  }

  static async update(id: string, data: any) {
    return prisma.location.update({ where: { id }, data });
  }

  static async softDelete(id: string) {
    return prisma.location.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
