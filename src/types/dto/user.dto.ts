import { UserRole } from "@prisma/client";

// Base user interface
export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// Create user request DTO
export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: UserRole;
}

// Update user request DTO
export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
}

// User response DTO (excludes password)
export interface UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
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
