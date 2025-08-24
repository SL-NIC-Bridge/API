import { Application, Prisma, ApplicationStatus } from '@prisma/client';
import { BaseRepository } from './baseRepository';
import { CreateApplicationDto, UpdateApplicationStatusDto, ApplicationFilterDto } from '../types/dto/application.dto';
import { ApplicationStatusEnum } from '@prisma/client';

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
  ): Promise<{ data: Application[]; total: number }> {
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
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
            attachments: { select: { id: true, attachmentType: true, fileName: true, fileUrl: true, createdAt: true } },
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

  // Get single application with details
  async findByIdWithDetails(id: string): Promise<Application | null> {
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
): Promise<Application> {
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
  async getAuditLogs(applicationId: string): Promise<ApplicationStatus[]> {
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
}
