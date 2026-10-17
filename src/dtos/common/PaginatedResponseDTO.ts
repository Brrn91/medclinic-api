export interface PaginationMetaDTO {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponseDTO<T> {
  data: T[];
  meta: PaginationMetaDTO;
}
