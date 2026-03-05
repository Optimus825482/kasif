import { successResponse, errorResponse } from "@/lib/api-response";
import { CategoryService } from "@/services/category.service";

export async function GET() {
  try {
    const categories = await CategoryService.getAll();
    return successResponse(categories);
  } catch {
    return errorResponse("Sunucu hatası", 500);
  }
}
