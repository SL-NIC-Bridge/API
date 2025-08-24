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
import { ApplicationCurrentStatus, ApplicationType } from '@prisma/client';

export class ApplicationController extends BaseController {
  private static applicationRepository = new ApplicationRepository();

  // Create application
  static createApplication = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.headers['x-user-id'] as string | undefined;
    const applicationData: CreateApplicationDto = req.body;

    ApplicationController.validateRequiredFields(req.body, ['applicationType', 'applicationData']);
    if (!userId) throw new UnauthorizedError('User not authenticated');

    const application = await ApplicationController.applicationRepository.create({
      applicationType: applicationData.applicationType,
      applicationData: applicationData.applicationData,
      currentStatus: ApplicationCurrentStatus.SUBMITTED,
      user: { connect: { id: userId } },
    });

    const applicationResponse: ApplicationResponseDto = {
      id: application.id,
      userId: application.userId,
      applicationType: application.applicationType,
      applicationData: application.applicationData,
      currentStatus: application.currentStatus,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      user: { id: userId, firstName: '', lastName: '', email: '' },
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
      type: req.query['type'] as ApplicationType | undefined,
      userId: req.query['userId'] as string | undefined,
      dateFrom: req.query['dateFrom'] as string | undefined,
      dateTo: req.query['dateTo'] as string | undefined,
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
        email: app.user.email
      } : { id: '', firstName: '', lastName: '', email: '' },
      attachments: app.attachments?.map(att => ({
        id: att.id,
        attachmentType: att.attachmentType,
        fileName: att.fileName,
        fileUrl: att.fileUrl,
        createdAt: att.createdAt
      })) ?? []
    }));

    const pagination = ApplicationController.calculatePagination(page, limit, total);
    ApplicationController.logSuccess('Get applications', { count: applicationResponses.length, page, limit });
    return ApplicationController.sendPaginatedSuccess(res, applicationResponses, pagination);
  }

  // Get application by ID
  static getApplication = async (req: Request, res: Response): Promise<Response> => {
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
        email: application.user.email
      } : { id: '', firstName: '', lastName: '', email: '' },
      attachments: application.attachments?.map(att => ({
        id: att.id,
        attachmentType: att.attachmentType,
        fileName: att.fileName,
        fileUrl: att.fileUrl,
        createdAt: att.createdAt
      })) ?? []
    };

    ApplicationController.logSuccess('Get application by ID', { applicationId: id });
    return ApplicationController.sendSuccess(res, applicationResponse);
  }

  // Update application status
  static updateStatus = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params['id'];
    const { status, comment }: UpdateApplicationStatusDto = req.body;
    const actorUserId = req.headers['x-user-id'] as string | undefined;

    ApplicationController.validateRequiredParams(req.params, ['id']);
    ApplicationController.validateRequiredFields(req.body, ['status']);
    if (!actorUserId) throw new UnauthorizedError('User not authenticated');
    if (!id) throw new NotFoundError('Application ID is required');

    const application = await ApplicationController.applicationRepository.updateStatus(
      id, status as ApplicationCurrentStatus, actorUserId, comment
    );

    ApplicationController.logSuccess('Update application status', { applicationId: id, status, actorUserId });
    return ApplicationController.sendSuccess(res, { 
      id: application.id,
      currentStatus: application.currentStatus,
      updatedAt: application.updatedAt
    });
  }

  // Get audit logs for application
  static getAuditLogs = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params['id'];
    ApplicationController.validateRequiredParams(req.params, ['id']);
    if (!id) throw new NotFoundError('Application ID is required');

    const auditLogs = await ApplicationController.applicationRepository.getAuditLogs(id);

    const auditLogResponses: AuditLogResponseDto[] = auditLogs.map(log => ({
      id: log.id,
      applicationId: log.applicationId,
      actorUserId: log.actorUserId,
      status: log.status as ApplicationCurrentStatus,
      comment: log.comment ?? undefined,
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
}
