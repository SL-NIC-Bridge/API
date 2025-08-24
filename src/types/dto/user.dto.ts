// import { UserRole } from "@prisma/client";

// // Base user interface
// export interface IUser {
//   id: string;
//   email: string;
//   firstName: string;
//   lastName: string;
//   role: UserRole;
//   createdAt: Date;
//   updatedAt: Date;
// }

// // Create user request DTO
// export interface CreateUserDto {
//   email: string;
//   firstName: string;
//   lastName: string;
//   password: string;
//   role: UserRole;
// }

// // Update user request DTO
// export interface UpdateUserDto {
//   email?: string;
//   firstName?: string;
//   lastName?: string;
// }

// // User response DTO (excludes password)
// export interface UserResponseDto {
//   id: string;
//   email: string;
//   firstName: string;
//   lastName: string;
//   role: UserRole;
//   createdAt: Date;
//   updatedAt: Date;
// }

// // User list response DTO
// export type UserListResponseDto = {
//   success: true;
//   data: UserResponseDto[];
// };

// // Single user response DTO
// export type SingleUserResponseDto = {
//   success: true;
//   data: UserResponseDto;
// };

import { UserRole, UserCurrentStatus } from "@prisma/client";

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role?: UserRole;
  divisionId?: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: UserRole;
  divisionId?: string;
  currentStatus?: UserCurrentStatus;
}

export interface UserResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  currentStatus: UserCurrentStatus;
  divisionId?: string | undefined;
  createdAt: Date;
  updatedAt: Date;
  division?:
    | {
        id: string;
        name: string;
        code: number;
      }
    | undefined;
}

export interface UserListResponseDto {
  success: true;
  data: UserResponseDto[];
}

export interface SingleUserResponseDto {
  success: true;
  data: UserResponseDto;
}

export interface PendingRegistrationDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: Date;
}

export interface ApproveRegistrationDto {
  approved: boolean;
  comment?: string;
}

export interface ResetPasswordDto {
  newPassword: string;
}
