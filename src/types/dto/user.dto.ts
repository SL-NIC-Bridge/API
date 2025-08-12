import { Role } from '@prisma/client';

// Base user interface
export interface IUser {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

// Create user request DTO
export interface CreateUserDto {
  email: string;
  name?: string | null;
  password: string;
  role?: Role;
}

// Update user request DTO
export interface UpdateUserDto {
  email?: string;
  name?: string | null;
  role?: Role;
}

// User response DTO (excludes password)
export interface UserResponseDto {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

// User list response DTO
export type UserListResponseDto = {
  success: true;
  data: UserResponseDto[];
};

// Single user response DTO
export type SingleUserResponseDto = {
  success: true;
  data: UserResponseDto;
}; 