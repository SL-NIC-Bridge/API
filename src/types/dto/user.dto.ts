
import { UserRole, UserCurrentStatus } from "@prisma/client";


export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  phone: string;
  // currentStatus: 'ACTIVE' | 'PENDING_APPROVAL' | 'REJECTED' | 'DEACTIVATED';
  role: UserRole;
  additionalData?: {
    nic?: string;
    [key: string]: any;
  };
  gnDivisionId?: string;
  divisionId?: string;
}

export interface CreateGNRegistrationDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  nic: string;
  divisionId: string;
  signatureDataUrl: string; // Base64 signature data
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: UserRole;
  divisionId?: string;
  currentStatus?: UserCurrentStatus;
  additionalData?: {
    nic?: string;
    [key: string]: any;
  };
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
  additionalData?: {
    nic?: string;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
  division?: {
    id: string;
    name: string;
    code: string;
  };
  signatureAttachment?: {
    id: string;
    fileUrl: string;
    fileName: string;
  };
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
  additionalData?: {
    nic?: string;
    [key: string]: any;
  };
  divisionId?: string;
  createdAt: Date;
  division?: {
    id: string;
    name: string;
    code: string;
  };
  signatureAttachment?: {
    id: string;
    fileUrl: string;
    fileName: string;
  };
}

export interface ApproveRegistrationDto {
  approved: boolean;
  comment?: string;
}

export interface ResetPasswordDto {
  newPassword: string;
}