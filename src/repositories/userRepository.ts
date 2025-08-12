import { Role } from '@prisma/client';
import { BaseRepository } from './baseRepository';
import { CreateUserDto, UpdateUserDto } from '../types/dto';

export interface UserSelect {
  id: boolean;
  email: boolean;
  name: boolean;
  role: boolean;
  createdAt: boolean;
  updatedAt: boolean;
}

// User without password for safe return types
export interface UserWithoutPassword {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithPosts extends UserWithoutPassword {
  posts: Array<{
    id: string;
    title: string;
    content: string | null;
    published: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

export class UserRepository extends BaseRepository {
  private readonly defaultSelect: UserSelect = {
    id: true,
    email: true,
    name: true,
    role: true,
    createdAt: true,
    updatedAt: true,
  };

  /**
   * Find all users with optional pagination
   */
  async findAll(select?: Partial<UserSelect>): Promise<UserWithoutPassword[]> {
    return this.executeQuery(
      () => this.prisma.user.findMany({
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
      () => this.prisma.user.findUnique({
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
      () => this.prisma.user.findUnique({
        where: { email },
        select: { ...this.defaultSelect, ...select },
      }),
      'findByEmail',
      'user'
    );
  }

  /**
   * Find user by ID with posts
   */
  async findByIdWithPosts(id: string): Promise<UserWithPosts | null> {
    return this.executeQuery(
      () => this.prisma.user.findUnique({
        where: { id },
        include: {
          posts: {
            select: {
              id: true,
              title: true,
              content: true,
              published: true,
              createdAt: true,
              updatedAt: true,
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
      'findByIdWithPosts',
      'user'
    );
  }

  /**
   * Create a new user
   */
  async create(userData: CreateUserDto): Promise<UserWithoutPassword> {
    return this.executeQuery(
      () => this.prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name || null,
          password: userData.password, // Note: In production, hash the password
          role: userData.role || 'USER',
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
      ...(updateData.name !== undefined && { name: updateData.name }),
      ...(updateData.role && { role: updateData.role }),
    };

    return this.executeQuery(
      () => this.prisma.user.update({
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
      () => this.prisma.user.delete({
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
      () => this.prisma.user.findUnique({ where: { email } }),
      'existsByEmail',
      'user'
    );
  }

  /**
   * Check if user exists by ID
   */
  async existsById(id: string): Promise<boolean> {
    return this.exists(
      () => this.prisma.user.findUnique({ where: { id } }),
      'existsById',
      'user'
    );
  }

  /**
   * Find users by role
   */
  async findByRole(role: Role, select?: Partial<UserSelect>): Promise<UserWithoutPassword[]> {
    return this.executeQuery(
      () => this.prisma.user.findMany({
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
      () => this.prisma.user.count(),
      'count',
      'users'
    );
  }

  /**
   * Count users by role
   */
  async countByRole(role: Role): Promise<number> {
    return this.executeQuery(
      () => this.prisma.user.count({ where: { role } }),
      'countByRole',
      'users'
    );
  }
} 