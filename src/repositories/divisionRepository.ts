import { Division, Prisma } from '@prisma/client';
import { BaseRepository } from './baseRepository';

export class DivisionRepository extends BaseRepository<
  Division,
  Prisma.DivisionCreateInput,
  Prisma.DivisionUpdateInput
> {
  protected model = this.prisma.division;

  // Find division by code
  async findByCode(code: string) {
    try {
      return await this.model.findUnique({
        where: { code },
      });
    } catch (error) {
      throw error;
    }
  }

  // Find all divisions with user count
  async findWithUserCount(){
    try {
      return await this.model.findMany({
        include: {
          _count: {
            select: {
              users: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
