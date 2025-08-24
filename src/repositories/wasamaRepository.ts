import { Division, Prisma } from '@prisma/client';
import { BaseRepository } from './baseRepository';
import { CreateWasamaDto, UpdateWasamaDto } from '../types/dto/wasama.dto';

export class WasamaRepository extends BaseRepository<
  Division,
  Prisma.DivisionCreateInput,
  Prisma.DivisionUpdateInput
> {
  protected model = this.prisma.division;

  // Find division by code
  async findByCode(code: number): Promise<Division | null> {
    try {
      return await this.model.findUnique({
        where: { code },
      });
    } catch (error) {
      throw error;
    }
  }

  // Find all divisions with user count
  async findWithUserCount(): Promise<
    (Division & { _count: { users: number } })[]
  > {
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
