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

export class UserController extends BaseController {
  private static userRepository = new UserRepository();

  // Get all users
  static getAllUsers = async (_req: Request, res: Response): Promise<Response<UserListResponseDto>> => {
    const users = await UserController.userRepository.findAll();

    const userResponses: UserResponseDto[] = users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
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
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
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

    const user = await UserController.userRepository.create(userData);

    const userResponse: UserResponseDto = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    UserController.logSuccess('Create user', { userId: user.id, email: userData.email });
    return UserController.sendSuccess(res, userResponse, 201) as Response<SingleUserResponseDto>;
  }

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
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
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