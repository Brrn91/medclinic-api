import { PaginatedResponseDTO } from "../dtos/common/PaginatedResponseDTO";

export function getOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponseDTO<T> {
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
