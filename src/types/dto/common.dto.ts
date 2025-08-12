// Generic success response DTO
export interface SuccessResponseDto<T = any> {
  success: true;
  data: T;
}

// Generic error response DTO
export interface ErrorResponseDto {
  success: false;
  error: {
    message: string;
    details?: string;
    code?: string;
  };
}

// Pagination DTO
export interface PaginationDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Paginated response DTO
export interface PaginatedResponseDto<T = any> {
  success: true;
  data: T[];
  pagination: PaginationDto;
}

// API response DTO (union type)
export type ApiResponseDto<T = any> = SuccessResponseDto<T> | ErrorResponseDto; 