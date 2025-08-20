import { BaseRepository } from './baseRepository';
import { CreateUserDto, UpdateUserDto } from '../types/dto';
import { UserAccountStatusEnum, UserRole } from '@prisma/client';

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

// User without password for safe return types
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

export class UserRepository extends BaseRepository {
  private readonly defaultSelect: UserSelect = {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    role: true,
    createdAt: true,
    updatedAt: true,
    currentStatus: true,
  };

  /**
   * Find all users with optional pagination
   */
  async findAll(select?: Partial<UserSelect>): Promise<UserWithoutPassword[]> {
    return this.executeQuery(
      () => this.db.user.findMany({
        select: { ...this.defaultSelect, ...select },
        orderBy: { createdAt: 'desc' },
      }),
      'findAll',
      'users'
    );
  }

  /**
   * Find user by ID
   */
  async findById(id: string, select?: Partial<UserSelect>): Promise<UserWithoutPassword | null> {
    return this.executeQuery(
      () => this.db.user.findUnique({
        where: { id },
        select: { ...this.defaultSelect, ...select },
      }),
      'findById',
      'user'
    );
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string, select?: Partial<UserSelect>): Promise<UserWithoutPassword | null> {
    return this.executeQuery(
      () => this.db.user.findUnique({
        where: { email },
        select: { ...this.defaultSelect, ...select },
      }),
      'findByEmail',
      'user'
    );
  }

  /**
   * Create a new user
   */
  async create(userData: CreateUserDto): Promise<UserWithoutPassword> {
    return this.executeQuery(
      () => this.db.user.create({
        data: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          passwordHash: userData.password, // Note: In production, hash the password
          role: userData.role || UserRole.STANDARD,
          currentStatus: UserAccountStatusEnum.ACTIVE
        },
        select: this.defaultSelect,
      }),
      'create',
      'user'
    );
  }

  /**
   * Update user by ID
   */
  async updateById(id: string, updateData: UpdateUserDto): Promise<UserWithoutPassword> {
    const updateDataFiltered = {
      ...(updateData.email && { email: updateData.email }),
      ...(updateData.firstName !== undefined && { firstName: updateData.firstName }),
      ...(updateData.lastName !== undefined && { lastName: updateData.lastName }),
    };

    return this.executeQuery(
      () => this.db.user.update({
        where: { id },
        data: updateDataFiltered,
        select: this.defaultSelect,
      }),
      'updateById',
      'user'
    );
  }

  /**
   * Delete user by ID
   */
  async deleteById(id: string): Promise<UserWithoutPassword> {
    return this.executeQuery(
      () => this.db.user.delete({
        where: { id },
        select: this.defaultSelect,
      }),
      'deleteById',
      'user'
    );
  }

  /**
   * Check if user exists by email
   */
  async existsByEmail(email: string): Promise<boolean> {
    return this.exists(
      () => this.db.user.findUnique({ where: { email } }),
      'existsByEmail',
      'user'
    );
  }

  /**
   * Check if user exists by ID
   */
  async existsById(id: string): Promise<boolean> {
    return this.exists(
      () => this.db.user.findUnique({ where: { id } }),
      'existsById',
      'user'
    );
  }

  /**
   * Find users by role
   */
  async findByRole(role: UserRole, select?: Partial<UserSelect>): Promise<UserWithoutPassword[]> {
    return this.executeQuery(
      () => this.db.user.findMany({
        where: { role },
        select: { ...this.defaultSelect, ...select },
        orderBy: { createdAt: 'desc' },
      }),
      'findByRole',
      'users'
    );
  }

  /**
   * Count total users
   */
  async count(): Promise<number> {
    return this.executeQuery(
      () => this.db.user.count(),
      'count',
      'users'
    );
  }

  /**
   * Count users by role
   */
  async countByRole(role: UserRole): Promise<number> {
    return this.executeQuery(
      () => this.db.user.count({ where: { role } }),
      'countByRole',
      'users'
    );
  }
} 