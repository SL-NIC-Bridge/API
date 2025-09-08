import { AttachmentType } from '@prisma/client';

export interface UploadDocumentDto {
  attachmentType: AttachmentType;
  fieldKey?: string;
  applicationId?: string;
  metadata?: any;
}

export interface DocumentResponseDto {
  id: string;
  attachmentType: AttachmentType;
  fileName: string;
  fileUrl: string;
  applicationId?: string;
  fieldKey?: string | null;
  metadata?: any;
  createdAt: Date;
  uploadedByUser: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface SignDocumentDto {
  documentId: string;
  signatureData: string;
  reason?: string;
  location?: string;
}

export interface SignedDocumentResponseDto {
  id: string;
  documentId: string;
  signatureData: string;
  isVerified: boolean;
  createdAt: Date;
}