export interface CreateDivisionDto {
  code: number;
  name: string;
}

export interface UpdateDivisionDto {
  name?: string;
}

export interface DivisionResponseDto {
  id: string;
  code: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}