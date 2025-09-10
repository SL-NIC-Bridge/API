import { Request, Response } from 'express';
import { BaseController } from './baseController';
import { AttachmentRepository } from '../repositories/attachmentRepository';
import {
  UploadDocumentDto,
  DocumentResponseDto,
  SignDocumentDto,
  SignedDocumentResponseDto,
} from '../types/dto/document.dto';
import { UnauthorizedError, NotFoundError, ValidationError } from '../utils/errors';
import { getFileUrl } from '../utils/fileUpload';

export class DocumentController extends BaseController {
  private static attachmentRepository = new AttachmentRepository();

  // Upload document
  static uploadDocument = async (req: Request, res: Response): Promise<Response> => {
    const uploadData: UploadDocumentDto = req.body;
    const userId = (req as any).user?.userId;
    const file = req.file;

    // if (!userId) throw new UnauthorizedError('User not authenticated');
    if (!file) throw new ValidationError('No file uploaded');

    // DocumentController.validateRequiredFields(req.body, ['attachmentType']);

    const attachment = await DocumentController.attachmentRepository.createAttachment({
      uploadedByUser: {
        connect: {
          id: userId
        }
      },
      attachmentType: uploadData.attachmentType,
      fileUrl: getFileUrl(file.filename),
      fileName: file.originalname,
      fieldKey: uploadData.fieldKey || null,
      metadata: uploadData.metadata,
      application: {
        connect: {
          id: uploadData.applicationId!
        }
      }
    });

    const documentResponse: DocumentResponseDto = {
      id: attachment.id,
      attachmentType: attachment.attachmentType,
      fileName: attachment.fileName,
      fileUrl: attachment.fileUrl,
      applicationId: attachment.applicationId!,
      fieldKey: attachment.fieldKey,
      metadata: attachment.metadata,
      createdAt: attachment.createdAt,
      uploadedByUser: attachment.uploadedByUserId
        ? {
            id: attachment.uploadedByUser.id,
            firstName: attachment.uploadedByUser.firstName,
            lastName: attachment.uploadedByUser.lastName,
          }
        : {
            id: '',
            firstName: '',
            lastName: '',
          },
    };

    DocumentController.logSuccess('Document uploaded', {
      attachmentId: attachment.id,
      fileName: file.originalname,
      userId,
    });

    return DocumentController.sendSuccess(res, documentResponse, 201);
  };

  // Get documents by application ID
  static getDocuments = async (req: Request, res: Response): Promise<Response> => {
    const { applicationId } = req.params;

    if (!applicationId){
       throw new NotFoundError('Application ID is required');
    }

    DocumentController.validateRequiredParams(req.params, ['applicationId']);

    const attachments = await DocumentController.attachmentRepository.findByApplicationId(applicationId);

    const documentResponses: DocumentResponseDto[] = attachments.map((attachment) => ({
      id: attachment.id,
      attachmentType: attachment.attachmentType,
      fileName: attachment.fileName,
      fileUrl: attachment.fileUrl,
      fieldKey: attachment.fieldKey,
      applicationId: attachment.applicationId!,
      metadata: attachment.metadata,
      createdAt: attachment.createdAt,
      uploadedByUser: attachment.uploadedByUserId
        ? {
            id: attachment.uploadedByUser.id,
            firstName: attachment.uploadedByUser.firstName,
            lastName: attachment.uploadedByUser.lastName,
          }
        : {
            id: '',
            firstName: '',
            lastName: '',
          },
    }));

    DocumentController.logSuccess('Get documents', { applicationId, count: documentResponses.length });
    return DocumentController.sendSuccess(res, documentResponses);
  };

  // Get user documents
  static getUserDocuments = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) throw new UnauthorizedError('User not authenticated');

    const attachments = await DocumentController.attachmentRepository.findByUserId(userId);

    const documentResponses: DocumentResponseDto[] = attachments.map((attachment) => ({
      id: attachment.id,
      attachmentType: attachment.attachmentType,
      fileName: attachment.fileName,
      fileUrl: attachment.fileUrl,
      applicationId: attachment.applicationId!,
      fieldKey: attachment.fieldKey,
      metadata: attachment.metadata,
      createdAt: attachment.createdAt,
      uploadedByUser: {
        id: userId,
        firstName: attachment.uploadedByUser.firstName,
        lastName:  attachment.uploadedByUser.firstName,
      },
    }));

    DocumentController.logSuccess('Get user documents', { userId, count: documentResponses.length });
    return DocumentController.sendSuccess(res, documentResponses);
  };

  // Sign document (placeholder implementation)
  static signDocument = async (req: Request, res: Response): Promise<Response> => {
    const signData: SignDocumentDto = req.body;
    const userId = req.headers['x-user-id'] as string;

    if (!userId) throw new UnauthorizedError('User not authenticated');

    DocumentController.validateRequiredFields(req.body, ['documentId', 'signatureData']);

    const document = await DocumentController.attachmentRepository.findById(signData.documentId);

    if (!document) throw new NotFoundError('Document not found');

    const signedDocumentResponse: SignedDocumentResponseDto = {
      id: `signed-${signData.documentId}`,
      documentId: signData.documentId,
      signatureData: signData.signatureData,
      isVerified: true,
      createdAt: new Date(),
    };

    DocumentController.logSuccess('Document signed', { documentId: signData.documentId, userId });
    return DocumentController.sendSuccess(res, signedDocumentResponse);
  };

  // Get signed document (placeholder)
  static getSignedDocument = async (req: Request, res: Response): Promise<Response> => {
    const { documentId } = req.params;

    if(!documentId) throw new NotFoundError('Document ID is required')

    DocumentController.validateRequiredParams(req.params, ['documentId']);

    const signedDocumentResponse: SignedDocumentResponseDto = {
      id: `signed-${documentId}`,
      documentId,
      signatureData: 'mock-signature-data',
      isVerified: true,
      createdAt: new Date(),
    };

    DocumentController.logSuccess('Get signed document', { documentId });
    return DocumentController.sendSuccess(res, signedDocumentResponse);
  };

  // Verify signature (placeholder)
  static verifySignature = async (req: Request, res: Response): Promise<Response> => {
    const { documentId } = req.params;

    DocumentController.validateRequiredParams(req.params, ['documentId']);

    const verificationResult = {
      isValid: true,
      signedBy: 'John Doe',
      signedAt: new Date(),
      documentHash: 'mock-hash',
    };

    DocumentController.logSuccess('Signature verified', { documentId });
    return DocumentController.sendSuccess(res, verificationResult);
  };
}
