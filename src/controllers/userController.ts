import { Request, Response } from 'express';
import { BaseController } from './baseController';
import { UserRepository } from '../repositories';
import { 
  CreateUserDto, 
  UpdateUserDto, 
  UserResponseDto, 
  UserListResponseDto, 
  SingleUserResponseDto 
} from '../types/dto';
import * as bcrypt from 'bcryptjs';
import { UserCurrentStatus } from '@prisma/client';

export class UserController extends BaseController {
    static getPendingRegistrations(getPendingRegistrations: any): import("express-serve-static-core").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>> {
        throw new Error('Method not implemented.');
    }
    static approveRegistration(approveRegistration: any): import("express-serve-static-core").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>> {
        throw new Error('Method not implemented.');
    }
    static getAllGNs(getAllGNs: any): import("express-serve-static-core").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>> {
        throw new Error('Method not implemented.');
    }
    static updateGN(updateGN: any): import("express-serve-static-core").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>> {
        throw new Error('Method not implemented.');
    }
    static resetPassword(resetPassword: any): import("express-serve-static-core").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>> {
        throw new Error('Method not implemented.');
    }
  private static userRepository = new UserRepository();

  // Get all users
  static getAllUsers = async (_req: Request, res: Response): Promise<Response<UserListResponseDto>> => {
    const users = await UserController.userRepository.findAll();

    const userResponses: UserResponseDto[] = users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      currentStatus: 'ACTIVE'
    }));

    UserController.logSuccess('Get all users', { count: userResponses.length });
    return UserController.sendSuccess(res, userResponses) as Response<UserListResponseDto>;
  }

  // Get user by ID
  static getUserById = async (req: Request, res: Response): Promise<Response<SingleUserResponseDto>> => {
    const { id } = req.params;
    
    UserController.validateRequiredParams(req.params, ['id']);
    
    const user = await UserController.userRepository.findById(id!);

    if (!user) {
      throw new Error('User not found');
    }

    const userResponse: UserResponseDto = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      currentStatus: user.currentStatus
    };

    UserController.logSuccess('Get user by ID', { userId: id });
    return UserController.sendSuccess(res, userResponse) as Response<SingleUserResponseDto>;
  }

  // Create new user
static createUser = async (req: Request, res: Response): Promise<Response<SingleUserResponseDto>> => {
  const userData: CreateUserDto = req.body;

  UserController.validateRequiredFields(req.body, ['email', 'password']);

  // Check if user already exists
  const existingUser = await UserController.userRepository.findByEmail(userData.email);
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash the password
  const passwordHash = await bcrypt.hash(userData.password, 10);

  // Map DTO to Prisma UserCreateInput
  const createInput = {
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    phone: userData.phone,
    passwordHash, // required by Prisma
    role: userData.role ?? 'STANDARD', // default role
    divisionId: userData.divisionId ?? null,
    currentStatus: UserCurrentStatus.ACTIVE, // default status
  };

  // Create user in database
  const user = await UserController.userRepository.create(createInput);

  // Map to response DTO
  const userResponse: UserResponseDto = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    phone: user.phone,
    currentStatus: user.currentStatus,
    divisionId: user.divisionId ?? undefined,
  };

  UserController.logSuccess('Create user', { userId: user.id, email: userData.email });
  return UserController.sendSuccess(res, userResponse, 201) as Response<SingleUserResponseDto>;
};

  // Update user
  static updateUser = async (req: Request, res: Response): Promise<Response<SingleUserResponseDto>> => {
    const { id } = req.params;
    const updateData: UpdateUserDto = req.body;

    UserController.validateRequiredParams(req.params, ['id']);

    const user = await UserController.userRepository.updateById(id!, updateData);

    const userResponse: UserResponseDto = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      currentStatus: 'ACTIVE'
    };

    UserController.logSuccess('Update user', { userId: id });
    return UserController.sendSuccess(res, userResponse) as Response<SingleUserResponseDto>;
  }

  // Delete user
  static deleteUser = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;

    UserController.validateRequiredParams(req.params, ['id']);

    await UserController.userRepository.deleteById(id!);

    UserController.logSuccess('Delete user', { userId: id });
    return res.status(204).send();
  }
} 