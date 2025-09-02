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
import { UnauthorizedError, ConflictError } from "../utils/errors";
import { UserAccountStatusEnum } from "@prisma/client";

export class AuthController extends BaseController {
  private static userRepository = new UserRepository();

  // -----------------------
  // LOGIN
  // -----------------------
  static login = async (req: Request, res: Response): Promise<Response> => {
    const { email, password }: LoginDto = req.body;

    AuthController.validateRequiredFields(req.body, ["email", "password"]);

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
      accessToken: "temp-token",
      refreshToken: "temp-refresh-token",
    };

    AuthController.logSuccess("User login", { userId: user.id, email });
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

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // Create user (UserCreateInput doesn't accept "password" directly)
    const user = await AuthController.userRepository.create({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      passwordHash: hashedPassword, // Use passwordHash for DB
      role: "GN",
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

    // Placeholder implementation
    const response = {
      accessToken: "new-temp-token",
      refreshToken: "new-temp-refresh-token",
    };

    AuthController.logSuccess("Token refresh");
    return AuthController.sendSuccess(res, response);
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
