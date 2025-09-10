import { ApplicationType, ApplicationCurrentStatus } from '@prisma/client';

export interface CreateApplicationDto {
  applicationType: ApplicationType;
  applicationData: any;
}

export interface UpdateApplicationStatusDto {
  status: ApplicationCurrentStatus;
  comment?: string;
}

export interface ApplicationResponseDto {
  id: string;
  userId: string;
  applicationType: ApplicationType;
  applicationData: any;
  currentStatus: ApplicationCurrentStatus;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    division?: {
      code:string;
      name: string;
    };
  };
  attachments: {
    id: string;
    attachmentType: string;
    fileName: string;
    fileUrl: string;
    createdAt: Date;
  }[];
}

export interface ApplicationFilterDto {
  status?: ApplicationCurrentStatus | undefined;
  type?: ApplicationType | undefined;
  userId?: string | undefined;
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
}

export interface AuditLogResponseDto {
  id: string;
  applicationId: string;
  actorUserId: string;
  status: ApplicationCurrentStatus;
  comment?: string;
  createdAt: Date;
  actor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}
