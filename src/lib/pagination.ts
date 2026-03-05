export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  pageCount: number;
}

export function buildPagination(
  page: number,
  limit: number,
  total: number,
): PaginationResult {
  return { page, limit, total, pageCount: Math.ceil(total / limit) };
}
