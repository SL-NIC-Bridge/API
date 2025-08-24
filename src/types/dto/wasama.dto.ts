export interface CreateWasamaDto {
  code: number;
  name: string;
}

export interface UpdateWasamaDto {
  name?: string;
}

export interface WasamaResponseDto {
  id: string;
  code: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}