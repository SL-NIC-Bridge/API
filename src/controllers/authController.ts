import { Request, Response } from "express";
import { BaseController } from "./baseController";
import { UserRepository } from "../repositories/userRepository";
import * as bcrypt from "bcryptjs";
import {
  LoginDto,
  RegisterDto,
  AuthResponseDto,
  RefreshTokenDto,
} from "../types/dto/auth.dto";
import { SingleUserResponseDto, UpdateUserDto, UserResponseDto } from "../types/dto/user.dto";
import { UnauthorizedError, ConflictError, ValidationError, NotFoundError } from "../utils/errors";
import { UserAccountStatusEnum, UserRole } from "@prisma/client";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { detectClientType, isRoleAllowedForClient } from '../utils/clientDetection';

export class AuthController extends BaseController {
  private static userRepository = new UserRepository();

  // -----------------------
  // LOGIN
  // -----------------------
  static login = async (req: Request, res: Response): Promise<Response> => {
    if (!req.body ) {
      throw new ValidationError("Request body is missing");
    }

    const { email, password }: LoginDto = req.body;

    AuthController.validateRequiredFields(req.body, ["email", "password"]);

    // Detect client type from request headers
    const userAgent = req.headers['user-agent'] || '';
    const clientTypeHeader = req.headers['x-client-type'] as string || '';
    const clientType = detectClientType(userAgent, clientTypeHeader);

    const user = await AuthController.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    if (user.currentStatus !== UserAccountStatusEnum.ACTIVE) {
      throw new UnauthorizedError("Account is not active");
    }

    // Check if user role is allowed for this client type
    if (!isRoleAllowedForClient(user.role, clientType)) {
      const deviceMessage = clientType === 'mobile' 
        ? 'Mobile app access is restricted to standard users only'
        : 'Web access is restricted to DS and GN users only';
      
      throw new UnauthorizedError(`Access denied: ${deviceMessage}`);
    }

    // generate tokens with userId and email (no client type in token)
    const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

    const authResponse: AuthResponseDto = {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        division: {
          id: user.division?.id ?? "",
          name: user.division?.name ?? "",
          code: user.division?.code ?? "",
        },
        currentStatus: user.currentStatus,
        divisionId: user.divisionId ?? undefined,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accessToken,
      refreshToken,
    };

    AuthController.logSuccess("User login", { 
      userId: user.id, 
      email,
      role: user.role,
      clientType 
    });
    return AuthController.sendSuccess(res, authResponse);
  };

  // -----------------------
  // REGISTER
  // -----------------------
  static register = async (req: Request, res: Response): Promise<Response> => {
    const userData: RegisterDto = req.body;

    AuthController.validateRequiredFields(req.body, [
      "firstName",
      "lastName",
      "email",
      "phone",
      "password",
    ]);

    // Check if user already exists
    const existingUser = await AuthController.userRepository.findByEmail(
      userData.email
    );

    if (existingUser) {
      throw new ConflictError("User with this email already exists");
    }

    // Hash the plain password from frontend
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // Create user (UserCreateInput doesn't accept "password" directly)
    const user = await AuthController.userRepository.create({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      passwordHash: hashedPassword, 
      role: UserRole.STANDARD, 
      additionalData: userData.additionalData ?? {},
      division: {
        connect: {
          id: userData.divisionId!,
        },
      },
      currentStatus: UserAccountStatusEnum.ACTIVE,
    });

     const additionalData: { nic?: string; [key: string]: any } =
  typeof user.additionalData === "object" && user.additionalData !== null
    ? user.additionalData
    : {};

    const accountStatus = await AuthController.userRepository.updateStatus(user.id, UserAccountStatusEnum.ACTIVE, user.id, 'Registration')

    const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

    const authResponse: AuthResponseDto = {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        additionalData: additionalData,
        currentStatus: user.currentStatus,
        divisionId: user.divisionId ?? undefined,
        phone: user.phone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accessToken,
      refreshToken
    };

    AuthController.logSuccess("User registration", {
      userId: user.id,
      email: userData.email,
      role: user.role,
      accountStatus,
    });

    return AuthController.sendSuccess(res, authResponse, 201);
  };

  // -----------------------
  // GET CURRENT USER
  // -----------------------
  static getCurrentUser = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const userId = (req as any).user?.userId;
    if (!userId) {
      throw new UnauthorizedError("User not authenticated");
    }

    const user = await AuthController.userRepository.findById(userId, {
      division: true,
    });

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    const userResponse: UserResponseDto = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone ?? "",
      role: user.role,
      currentStatus: user.currentStatus,
      divisionId: user.divisionId ?? undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      division: user.division,
    };

    AuthController.logSuccess("Get current user", { userId });
    return AuthController.sendSuccess(res, userResponse);
  };

  // -----------------------
  // REFRESH TOKEN
  // -----------------------
  static refreshToken = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const { refreshToken }: RefreshTokenDto = req.body;

    AuthController.validateRequiredFields(req.body, ["refreshToken"]);

    // verify and issue new tokens
    const payload = verifyRefreshToken(refreshToken);

    const newAccessToken = generateAccessToken({ userId: payload.userId, email: payload.email, role: payload.role });
    const newRefreshToken = generateRefreshToken({ userId: payload.userId, email: payload.email, role: payload.role });

    AuthController.logSuccess("Token refresh", { userId: payload.userId });
    return AuthController.sendSuccess(res, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  };

  // -----------------------
  // LOGOUT
  // -----------------------
  static logout = async (_req: Request, res: Response): Promise<Response> => {
    // No actual token invalidation yet
    AuthController.logSuccess("User logout");
    return AuthController.sendSuccess(res, {
      message: "Logged out successfully",
    });
  };

  static changePassword = async (req: Request, res: Response): Promise<Response> => {
    const userId = (req as any).user?.userId;
    if (!userId) {
      throw new UnauthorizedError("User not authenticated");
    }
    
    const { currentPassword, newPassword } = req.body;
    AuthController.validateRequiredFields(req.body, ["currentPassword", "newPassword"]);  

    const user = await AuthController.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new ValidationError("Current password is incorrect");
    }

    // Hash the new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user's password
    await AuthController.userRepository.updateById(userId, { passwordHash: hashedNewPassword });

    AuthController.logSuccess("Password changed", { userId });
    return AuthController.sendSuccess(res, { message: "Password changed successfully" });
  }

  static updateProfile = async (
    req: Request,
    res: Response
  ): Promise<Response<SingleUserResponseDto>> => {
    const userId = (req as any).user?.userId;
    const updateData: UpdateUserDto = req.body;

    if (!userId) {
      throw new NotFoundError("User not authenticated");
    }

    const user = await AuthController.userRepository.updateById(
      userId!,
      updateData
    );

    const userResponse: UserResponseDto = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      divisionId: user.divisionId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      currentStatus: user.currentStatus,
    };

    AuthController.logSuccess("Update user", { userId });
    return AuthController.sendSuccess(
      res,
      userResponse
    ) as Response<SingleUserResponseDto>;
  };
}
