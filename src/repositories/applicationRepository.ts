import { Application, Prisma, ApplicationCurrentStatus } from '@prisma/client';
import { BaseRepository } from './baseRepository';
import {  ApplicationFilterDto } from '../types/dto/application.dto';
import { ApplicationStatusEnum } from '@prisma/client';

import { EmailService } from '../services/EmailService';

export class ApplicationRepository extends BaseRepository<
  Application,
  Prisma.ApplicationCreateInput,
  Prisma.ApplicationUpdateInput
> {
  
  protected model = this.prisma.application;

  // Find applications with filters, search, pagination
  async findApplicationsWithFilters(
    filters: ApplicationFilterDto,
    page: number = 1,
    limit: number = 10,
    search?: string
  ){
    try {
      const where: Prisma.ApplicationWhereInput = {};

      // Filters
      if (filters.status) where.currentStatus = filters.status;
      if (filters.type) where.applicationType = filters.type;
      if (filters.userId) where.userId = filters.userId;
      if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
        if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
      }

      // Search across user fields
      if (search) {
        where.OR = [
          { user: { firstName: { contains: search, mode: 'insensitive' } } },
          { user: { lastName: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
        ];
      }

      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.model.findMany({
          where,
          include: {
            user: true,
            attachments: true,
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.model.count({ where }),
      ]);

      return { data, total };
    } catch (error) {
      throw error;
    }
  }

  async findDivisionApplicationsWithFilters (
    divisionId: string,
    filters: ApplicationFilterDto,
    page: number = 1,
    limit: number = 10,
    search?: string
  ) {
    try {
      const where: Prisma.ApplicationWhereInput = {
        user: { divisionId }
      };
      // Filters
      if (filters.status) where.currentStatus = filters.status;
      if (filters.type) where.applicationType = filters.type;
      if (filters.userId) where.userId = filters.userId;
      if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
        if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
      }
      // Search across user fields
      if (search) {
        where.OR = [
          { user: { firstName: { contains: search, mode: 'insensitive' } } },
          { user: { lastName: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
        ];
      }
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.model.findMany({
          where,
          include: {
            user: true,
            attachments: true,
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.model.count({ where }),
      ]);
      return { data, total };
    }
    catch (error) {
      throw error;
    }
  }


  // Get single application with details
  async findByIdWithDetails(id: string) {
    try {
      return await this.model.findUnique({
        where: { id },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
          attachments: { select: { id: true, attachmentType: true, fileName: true, fileUrl: true, metadata: true, createdAt: true } },
          applicationStatuses: {
            include: { actor: { select: { id: true, firstName: true, lastName: true, email: true, role: true } } },
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  // Update application status
async updateStatus(
  id: string,
  status: ApplicationStatusEnum,
  actorUserId: string,
  comment?: string
){
  try {
    return await this.prisma.$transaction(async (tx) => {
      const application = await tx.application.update({
        where: { id },
        data: { currentStatus: status },
      });

      await tx.applicationStatus.create({
        data: {
          applicationId: id,
          actorUserId,
          status,
          comment: comment ?? null,
        },
      });

      return application;
    });
  } catch (error) {
    throw error;
  }
}


  // Get audit logs
  async getAuditLogs(applicationId: string) {
    try {
      return await this.prisma.applicationStatus.findMany({
        where: { applicationId },
        include: { actor: { select: { id: true, firstName: true, lastName: true, email: true, role: true } } },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw error;
    }
  }

  // Add these methods to your ApplicationRepository class

/**
 * Find user by ID for getting actor details
 */
async findUserById(userId: string) {
  return await this.prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
    }
  });
}

/**
 * Update application status with email notification trigger
 */
async updateStatusWithNotification(
  id: string, 
  status: ApplicationCurrentStatus, 
  actorUserId: string, 
  comment?: string
) {
  // Get application with user details before update
  const applicationBefore = await this.findByIdWithDetails(id);
  if (!applicationBefore) {
    throw new Error('Application not found');
  }

  // Update the status
  const updatedApplication = await this.updateStatus(id, status, actorUserId, comment);

  // Get actor user details
  const actorUser = await this.findUserById(actorUserId);

  // Prepare email data if user exists and status actually changed
  if (applicationBefore.user && applicationBefore.currentStatus !== status) {
    const emailData = {
      userFirstName: applicationBefore.user.firstName,
      userLastName: applicationBefore.user.lastName,
      userEmail: applicationBefore.user.email,
      applicationId: id,
      applicationType: applicationBefore.applicationType,
      status: status,
      comment: comment,
      actorName: actorUser ? `${actorUser.firstName} ${actorUser.lastName}` : undefined,
    };

    // Send email notification (async, don't wait for it)
    EmailService.sendApplicationStatusUpdate(emailData)
      .catch(error => {
        console.error('Failed to send status update email:', error);
      });
  }

  return updatedApplication;
}

/**
 * Bulk status update with email notifications
 */
async bulkUpdateStatus(
  applicationIds: string[], 
  status: ApplicationCurrentStatus, 
  actorUserId: string, 
  comment?: string
) {
  const results = [];
  const emailQueue = [];

  for (const id of applicationIds) {
    try {
      const applicationBefore = await this.findByIdWithDetails(id);
      if (!applicationBefore) continue;

      const updatedApplication = await this.updateStatus(id, status, actorUserId, comment);
      results.push(updatedApplication);

      // Prepare email data for batch sending
      if (applicationBefore.user && applicationBefore.currentStatus !== status) {
        const actorUser = await this.findUserById(actorUserId);
        emailQueue.push({
          userFirstName: applicationBefore.user.firstName,
          userLastName: applicationBefore.user.lastName,
          userEmail: applicationBefore.user.email,
          applicationId: id,
          applicationType: applicationBefore.applicationType,
          status: status,
          comment: comment,
          actorName: actorUser ? `${actorUser.firstName} ${actorUser.lastName}` : undefined,
        });
      }
    } catch (error) {
      console.error(`Failed to update application ${id}:`, error);
    }
  }

  // Send bulk emails (async, don't wait)
  if (emailQueue.length > 0) {
    EmailService.sendBulkStatusUpdates(emailQueue)
      .catch(error => {
        console.error('Failed to send bulk status update emails:', error);
      });
  }

  return results;
}
}
