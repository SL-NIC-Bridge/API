export interface CreateDivisionDto {
  code: string;
  name: string;
}

export interface UpdateDivisionDto {
  name?: string;
}

export interface DivisionResponseDto {
  id: string;
  code: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}