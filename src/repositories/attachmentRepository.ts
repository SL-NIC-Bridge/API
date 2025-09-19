import { Attachment, Prisma } from '@prisma/client';
import { BaseRepository } from './baseRepository';

export class AttachmentRepository extends BaseRepository<
  Attachment,
  Prisma.AttachmentCreateInput,
  Prisma.AttachmentUpdateInput
> {
  protected model = this.prisma.attachment;

  // Find attachments by application
  async findByApplicationId(applicationId: string) {
    try {
      return await this.model.findMany({
        where: { applicationId },
        include: {
          uploadedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      throw error;
    }
  }

  // Find attachments by user
  async findByUserId(userId: string) {
    try {
      return await this.model.findMany({
        where: { uploadedByUserId: userId },
        include: {
          application: true,
          uploadedByUser: true
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      throw error;
    }
  }

  // Create new attachment
  async createAttachment(data: Prisma.AttachmentCreateInput) {
    try {
      return await this.model.create({
        data,
        include: {
          uploadedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
