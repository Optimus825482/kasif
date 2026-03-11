import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

const CACHE_TAG_CATEGORIES = "categories";
const CACHE_SECONDS = 300; // 5 minutes — categories rarely change

export class CategoryService {
  static async getAll() {
    return unstable_cache(
      async () =>
        prisma.category.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          include: {
            _count: {
              select: {
                locations: { where: { deletedAt: null, isActive: true } },
              },
            },
          },
        }),
      [CACHE_TAG_CATEGORIES],
      { revalidate: CACHE_SECONDS, tags: [CACHE_TAG_CATEGORIES] },
    )();
  }

  static async getById(id: string) {
    return prisma.category.findUnique({ where: { id } });
  }
}
