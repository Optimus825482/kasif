import { prisma } from "@/lib/prisma";

export class CategoryService {
  static async getAll() {
    return prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { locations: { where: { deletedAt: null, isActive: true } } },
        },
      },
    });
  }

  static async getById(id: string) {
    return prisma.category.findUnique({ where: { id } });
  }
}
