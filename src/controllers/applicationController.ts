import { Request, Response } from 'express';
import { BaseController } from './baseController';
import { ApplicationRepository } from '../repositories/applicationRepository';
import {
  CreateApplicationDto,
  UpdateApplicationStatusDto,
  ApplicationResponseDto,
  ApplicationFilterDto,
  AuditLogResponseDto
} from '../types/dto/application.dto';
import { NotFoundError, UnauthorizedError } from '../utils/errors';
import { ApplicationCurrentStatus, $Enums, AttachmentType } from '@prisma/client';

import { EmailService } from '../services/EmailService';
import { AttachmentRepository } from '../repositories/attachmentRepository';
import { getFileUrl } from '../utils/fileUpload';

export class ApplicationController extends BaseController {

  private static applicationRepository = new ApplicationRepository();
  private static attachmentRepository = new AttachmentRepository();

  // Create application
  static createApplication = async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId;
    const applicationData: CreateApplicationDto = req.body;

    ApplicationController.validateRequiredFields(req.body, ['applicationType', 'applicationData']);
    if (!userId) throw new UnauthorizedError('User not authenticated');

    const application = await ApplicationController.applicationRepository.create({
      applicationType: applicationData.applicationType,
      applicationData: applicationData.applicationData,
      currentStatus: ApplicationCurrentStatus.SUBMITTED,
      user: { connect: { id: userId } },
    });

    // Get user details for email
    const applicationWithUser = await ApplicationController.applicationRepository.findByIdWithDetails(application.id);
    
    if (applicationWithUser?.user) {
      // Send welcome email notification
      try {
        await EmailService.sendApplicationStatusUpdate({
          userFirstName: applicationWithUser.user.firstName,
          userLastName: applicationWithUser.user.lastName,
          userEmail: applicationWithUser.user.email,
          applicationId: application.id,
          applicationType: application.applicationType,
          status: 'SUBMITTED' as $Enums.ApplicationCurrentStatus,
        });
        ApplicationController.logSuccess('Welcome email sent', { applicationId: application.id, userEmail: applicationWithUser.user.email });
      } catch (emailError) {
        // Log email error but don't fail the application creation
        console.error('Failed to send welcome email:', emailError);
        ApplicationController.logError('Welcome email failed', { applicationId: application.id, error: emailError });
      }
    }

    const applicationResponse: ApplicationResponseDto = {
      id: application.id,
      userId: application.userId,
      applicationType: application.applicationType,
      applicationData: application.applicationData,
      currentStatus: application.currentStatus,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      user: { id: userId, firstName: '', lastName: '', email: '', phone: '' },
      attachments: [],
    };

    ApplicationController.logSuccess('Create application', { applicationId: application.id, userId });
    return ApplicationController.sendSuccess(res, applicationResponse, 201);
  }

  // Get applications with filters
static getApplications = async (req: Request, res: Response): Promise<Response> => {
    const { page, limit } = ApplicationController.getPaginationParams(req.query);
    const search = req.query['search'] as string | undefined;

    const filters: ApplicationFilterDto = {
        status: req.query['status'] as ApplicationCurrentStatus | undefined,
        // If no status is provided, don't filter by status (return all)
        // type: req.query['type'] as ApplicationType | undefined,
        // userId: req.query['userId'] as string | undefined,
        // dateFrom: req.query['dateFrom'] as string | undefined,
        // dateTo: req.query['dateTo'] as string | undefined,
    };

    const { data: applications, total } = await ApplicationController.applicationRepository.findApplicationsWithFilters(
        filters, page, limit, search
    );

    const applicationResponses: ApplicationResponseDto[] = applications.map(app => ({
        id: app.id,
        userId: app.userId,
        applicationType: app.applicationType,
        applicationData: app.applicationData,
        currentStatus: app.currentStatus,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,        
        user: app.user ? {
            id: app.user.id,
            firstName: app.user.firstName,
            lastName: app.user.lastName,
            phone: app.user.phone ?? "",
            email: app.user.email,
            division: {
                code: app?.user?.division?.code || '',
                name: app?.user?.division?.name || '',
            } 
        } : { id: '', firstName: '', lastName: '', email: '', phone: '' },
        attachments: app.attachments?.map(att => ({
            id: att.id,
            attachmentType: att.attachmentType,
            fileName: att.fileName,
            fileUrl: att.fileUrl,
            createdAt: att.createdAt,
            fieldKey: att.fieldKey || ''
        })) ?? []
    }));

    console.log('aaaaaaaaaaaaaaaaaaaaaaa', applications[0]?.user?.division);

    const pagination = ApplicationController.calculatePagination(page, limit, total);
    ApplicationController.logSuccess('Get applications', { count: applicationResponses.length, page, limit });
    return ApplicationController.sendPaginatedSuccess(res, applicationResponses, pagination);
}

  static getCurrentApplication = async (req: Request, res: Response): Promise<Response> => {
    const userId = (req as any).user?.userId;
    if (!userId) throw new UnauthorizedError('User not authenticated');

    const { data: applications, total } = await ApplicationController.applicationRepository.findApplicationsWithFilters(
      { userId }, 1, 1
    );

    if (total === 0) throw new NotFoundError('No application found for the user');

    const app = applications[0]!;
    const applicationResponse: ApplicationResponseDto = {
      id: app.id,
      userId: app.userId,
      applicationType: app.applicationType,
      applicationData: app.applicationData,
      currentStatus: app.currentStatus,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      user: app.user ? {
        id: app.user.id,
        firstName: app.user.firstName,
        lastName: app.user.lastName,
        email: app.user.email,
        phone: app.user.phone ?? "",
      } : {
        id: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
      },
      attachments: app.attachments?.map(att => ({
        id: att.id,
        attachmentType: att.attachmentType,
        fileName: att.fileName,
        fileUrl: att.fileUrl,
        createdAt: att.createdAt,
       
        fieldKey: att.fieldKey || ''
      })) ?? []
    };

    ApplicationController.logSuccess('Get current application', { applicationId: app.id, userId });
    return ApplicationController.sendSuccess(res, applicationResponse);
  }

  // Get application by ID
  static getApplication = async (req: Request, res: Response) => {
    const id = req.params['id'];
    ApplicationController.validateRequiredParams(req.params, ['id']);
    if (!id) throw new NotFoundError('Application ID is required');

    const application = await ApplicationController.applicationRepository.findByIdWithDetails(id);
    if (!application) throw new NotFoundError('Application not found');

    const applicationResponse: ApplicationResponseDto = {
      id: application.id,
      userId: application.userId,
      applicationType: application.applicationType,
      applicationData: application.applicationData,
      currentStatus: application.currentStatus,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      user: application.user ? {
        id: application.user.id,
        firstName: application.user.firstName,
        lastName: application.user.lastName,
        email: application.user.email,
        phone: application.user.phone ?? "",
        division: {
          code: application?.user?.division?.code || '',
          name: application?.user?.division?.name || '',
        }
      } : { id: '', firstName: '', lastName: '', email: '', phone: '' },
      attachments: application.attachments?.map(att => ({
        id: att.id,
        attachmentType: att.attachmentType,
        fileName: att.fileName,
        fileUrl: att.fileUrl,
        createdAt: att.createdAt,
        uploadedByUser: att.uploadedByUser ? {
          id: att.uploadedByUser.id,
          firstName: att.uploadedByUser.firstName,
          lastName: att.uploadedByUser.lastName,
          email: att.uploadedByUser.email,
        } : { id: '', firstName: '', lastName: '', email: '' },
        fieldKey: att.fieldKey || ''
        
      })) ?? []
    };

    ApplicationController.logSuccess('Get application by ID', { applicationId: id });
    return ApplicationController.sendSuccess(res, applicationResponse);
  }

  // Update application status
  static updateStatus = async (req: Request, res: Response) => {
    const id = req.params['id'];
    const { status, comment }: UpdateApplicationStatusDto = req.body;
    const actorUserId = (req as any).user?.userId;

    ApplicationController.validateRequiredParams(req.params, ['id']);
    ApplicationController.validateRequiredFields(req.body, ['status']);
    if (!actorUserId) throw new UnauthorizedError('User not authenticated');
    if (!id) throw new NotFoundError('Application ID is required');

    // Get application with user details before updating
    const applicationBefore = await ApplicationController.applicationRepository.findByIdWithDetails(id);
    if (!applicationBefore) throw new NotFoundError('Application not found');

    // Update the status
    const application = await ApplicationController.applicationRepository.updateStatus(
      id, status as ApplicationCurrentStatus, actorUserId, comment
    );

    // Get actor user details for email
    const actorUser = await ApplicationController.applicationRepository.findUserById(actorUserId);

    // Send email notification to the application owner
    if (applicationBefore.user && applicationBefore.currentStatus !== status) {
      try {
        await EmailService.sendApplicationStatusUpdate({
          userFirstName: applicationBefore.user.firstName,
          userLastName: applicationBefore.user.lastName,
          userEmail: applicationBefore.user.email,
          applicationId: id,
          applicationType: applicationBefore.applicationType,
          status: status as ApplicationCurrentStatus,
          comment: comment,
          actorName: actorUser ? `${actorUser.firstName} ${actorUser.lastName}` : undefined,
        });
        
        ApplicationController.logSuccess('Status update email sent', { 
          applicationId: id, 
          userEmail: applicationBefore.user.email, 
          newStatus: status 
        });
      } catch (emailError) {
        // Log email error but don't fail the status update
        console.error('Failed to send status update email:', emailError);
        ApplicationController.logError('Status update email failed', { 
          applicationId: id, 
          error: emailError 
        });
      }
    }

    ApplicationController.logSuccess('Update application status', { applicationId: id, status, actorUserId });
    return ApplicationController.sendSuccess(res, { 
      id: application.id,
      currentStatus: application.currentStatus,
      updatedAt: application.updatedAt
    });
  }

  // Get audit logs for application
  static getAuditLogs = async (req: Request, res: Response) => {
    const id = req.params['id'];
    ApplicationController.validateRequiredParams(req.params, ['id']);
    if (!id) throw new NotFoundError('Application ID is required');

    const auditLogs = await ApplicationController.applicationRepository.getAuditLogs(id);

    const auditLogResponses: AuditLogResponseDto[] = auditLogs.map(log => ({
      id: log.id,
      applicationId: log.applicationId,
      actorUserId: log.actorUserId,
      status: log.status as ApplicationCurrentStatus,
      comments: log.comment ?? undefined,
      createdAt: log.createdAt,
      actor: log.actor ? {
        id: log.actor.id,
        firstName: log.actor.firstName,
        lastName: log.actor.lastName,
        email: log.actor.email,
        role: log.actor.role
      } : { id: '', firstName: '', lastName: '', email: '', role: '' }
    }));

    ApplicationController.logSuccess('Get audit logs', { applicationId: id, count: auditLogResponses.length });
    return ApplicationController.sendSuccess(res, auditLogResponses);
  }

  /**
   * Resend notification email for current application status
   */
  static resendNotification = async (req: Request, res: Response) => {
    const id = req.params['id'];
    ApplicationController.validateRequiredParams(req.params, ['id']);
    if (!id) throw new NotFoundError('Application ID is required');

    const application = await ApplicationController.applicationRepository.findByIdWithDetails(id);
    if (!application) throw new NotFoundError('Application not found');
    if (!application.user) throw new NotFoundError('Application user not found');

    try {
      await EmailService.sendApplicationStatusUpdate({
        userFirstName: application.user.firstName,
        userLastName: application.user.lastName,
        userEmail: application.user.email,
        applicationId: application.id,
        applicationType: application.applicationType,
        status: application.currentStatus,
      });

      ApplicationController.logSuccess('Notification resent', { applicationId: id, userEmail: application.user.email });
      return ApplicationController.sendSuccess(res, { message: 'Notification email sent successfully' });
    } catch (emailError) {
      ApplicationController.logError('Failed to resend notification', { applicationId: id, error: emailError });
      throw new Error('Failed to send notification email');
    }
  }

    static getDivisionApplications = async (req: Request, res: Response): Promise<Response> => {
    const divisionId = req.params['id'];
    const { page, limit } = ApplicationController.getPaginationParams(req.query);
    const search = req.query['search'] as string | undefined;
    // const status = req.query['status'] as ApplicationCurrentStatus | undefined;

    const filters: ApplicationFilterDto = {
      //status,
      // type: req.query['type'] as ApplicationType | undefined,
      // userId: req.query['userId'] as string | undefined,
      // dateFrom: req.query['dateFrom'] as string | undefined,
      // dateTo: req.query['dateTo'] as string | undefined,
    };
    if (!divisionId) throw new NotFoundError('Division ID is required');

    const { data: applications, total } = await ApplicationController.applicationRepository.findDivisionApplicationsWithFilters(
      divisionId, filters, page, limit, search
    );
    const applicationResponses: ApplicationResponseDto[] = applications.map(app => ({
      id: app.id,
      userId: app.userId,
      applicationType: app.applicationType,
      applicationData: app.applicationData,
      currentStatus: app.currentStatus,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      user: app.user ? {
        id: app.user.id,
        firstName: app.user.firstName,
        lastName: app.user.lastName,
        phone: app.user.phone ?? "",
        email: app.user.email,
      } : { id: '', firstName: '', lastName: '', email: '' , phone: ''},
      attachments: app.attachments?.map(att => ({
        id: att.id,
        attachmentType: att.attachmentType,
        fileName: att.fileName,
        fileUrl: att.fileUrl,
        createdAt: att.createdAt,
        fieldKey: att.fieldKey || ''
      })) ?? []
    }));

    const pagination = ApplicationController.calculatePagination(page, limit, total);
    ApplicationController.logSuccess('Get GN applications', { divisionId, count: applicationResponses.length, page, limit });
    return ApplicationController.sendPaginatedSuccess(res, applicationResponses, pagination);
  }

  static signApplication = async (req: Request, res: Response) => {
    const { applicationId } = req.body;
    const actorUserId = (req as any).user?.userId;
    const file = req.file;

    ApplicationController.validateRequiredFields(req.body, [ 'applicationId']);
    if (!actorUserId) throw new UnauthorizedError('User not authenticated');
    if (!applicationId) throw new NotFoundError('Application ID is required');
    if (!file) throw new NotFoundError('Signature file is required');

    // Get application with user details before updating
    const applicationBefore = await ApplicationController.applicationRepository.findByIdWithDetails(applicationId);
    if (!applicationBefore) throw new NotFoundError('Application not found');

    // Sign the application
    const attachment = await ApplicationController.attachmentRepository.create({
      attachmentType: AttachmentType.CERTIFY_SIGNATURE,
      fileName: `signature_${applicationId}${file.filename.substring(file.filename.lastIndexOf('.'))}`,
      fileUrl: getFileUrl(file.filename),
      application: {
        connect: {
          id: applicationId
        }
      },
      uploadedByUser:{
        connect: {
          id: actorUserId
        }
      },
    });

    ApplicationController.logSuccess('Sign application', { applicationId, attachmentId: attachment.id, actorUserId });
    return ApplicationController.sendSuccess(res, { 
      id: attachment.id,
      fileName: attachment.fileName,
      fileUrl: attachment.fileUrl,
      createdAt: attachment.createdAt
    });
    
  }
}