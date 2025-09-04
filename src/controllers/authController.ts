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
import { UserResponseDto } from "../types/dto/user.dto";
import { UnauthorizedError, ConflictError, ValidationError } from "../utils/errors";
import { UserAccountStatusEnum } from "@prisma/client";
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
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    const authResponse: AuthResponseDto = {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone,
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

    // Detect client type from request headers
    const userAgent = req.headers['user-agent'] || '';
    const clientTypeHeader = req.headers['x-client-type'] as string || '';
    const clientType = detectClientType(userAgent, clientTypeHeader);

    // Set role based on client type
    const userRole = clientType === 'mobile' ? 'STANDARD' : 'GN';

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
      passwordHash: hashedPassword, // Use hashed password for DB
      role: userRole, // Set role based on client type
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
      accessToken: "temp-token",
      refreshToken: "temp-refresh-token",
    };

    AuthController.logSuccess("User registration", {
      userId: user.id,
      email: userData.email,
      role: user.role,
      clientType
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
    const userId = req.headers["x-user-id"] as string;
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

    const newAccessToken = generateAccessToken({ userId: payload.userId, email: payload.email });
    const newRefreshToken = generateRefreshToken({ userId: payload.userId, email: payload.email });

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
}
