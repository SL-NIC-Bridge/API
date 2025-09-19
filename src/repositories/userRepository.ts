import { UserRole } from '@prisma/client';
import { User, Prisma, UserCurrentStatus, UserAccountStatusEnum } from '@prisma/client';
import { BaseRepository } from './baseRepository';

export interface UserSelect {
  id: boolean;
  email: boolean;
  firstName: boolean;
  lastName: boolean;
  role: boolean;
  createdAt: boolean;
  updatedAt: boolean;
  currentStatus: boolean;
}

// // User without password for safe return types
export interface UserWithoutPassword {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  currentStatus: UserAccountStatusEnum;
}


export class UserRepository extends BaseRepository<
  User,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput
> {
  protected model = this.prisma.user;

  async findByEmail(email: string) {
    return this.model.findUnique({
      where: { email },
      include: { division: true },
    });
  }

  async findPendingUsers() {
    return this.model.findMany({
      where: { currentStatus: UserCurrentStatus.PENDING_APPROVAL },
      include: { division: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findGNUsers() {
    return this.model.findMany({
      where: {
        role: 'GN',
      },
      include: { division: true, accountStatuses: true },
      orderBy: { firstName: 'asc' },
    });
  }

  async updatePassword(id: string, hashedPassword: string): Promise<User> {
    return this.model.update({
      where: { id },
      data: { passwordHash: hashedPassword },
    });
  }
  // Update user status with audit logging
  async updateStatus(
  id: string,
  status: UserAccountStatusEnum,
  changedByUserId: string | null, // Allow null
  comment?: string
): Promise<User> {
  return this.prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id },
      data: { currentStatus: status },
    });

    await tx.userAccountStatus.create({
      data: {
        userId: id,
          status: UserAccountStatusEnum[status],  // match with `UserAccountStatusEnum`
          changedByUserId,
          comment: comment ?? null,               // FIX: pass null if undefined
      },
    });

    return user;
  });
}
}
