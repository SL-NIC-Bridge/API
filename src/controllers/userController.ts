import { Request, RequestHandler, Response } from "express";
import { BaseController } from "./baseController";
import { UserRepository } from "../repositories";
import {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
  UserListResponseDto,
  SingleUserResponseDto,
  PendingRegistrationDto,
  ApproveRegistrationDto,
  ResetPasswordDto,
} from "../types/dto";
import bcrypt from "bcryptjs";
import {
  UserCurrentStatus,
  UserRole,
  UserAccountStatusEnum,
} from "@prisma/client";
import { NotFoundError } from "../utils/errors";
import { getFileUrl } from '../utils/fileUpload';
import { AttachmentRepository } from '../repositories/attachmentRepository';

export class UserController extends BaseController {

  private static attachmentRepository = new AttachmentRepository();
  // Get pending GN registrations
  static getPendingRegistrations = async (
    _req: Request,
    res: Response
  ): Promise<Response> => {
    const pending = await UserController.userRepository.findPendingUsers();

    const response: PendingRegistrationDto[] = pending.map((u) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone,
      currentStatus: u.currentStatus,
      role: u.role,
      ...(u.additionalData
        ? {
            additionalData: {
              ...(u.additionalData as Record<string, any>),
              nic: (u.additionalData as any)?.nic ?? undefined,
            },
          }
        : {}),
      ...(u.divisionId ? { divisionId: u.divisionId } : {}),
      createdAt: u.createdAt,
      ...(u.division
        ? {
            division: {
              id: u.division.id,
              name: u.division.name,
              code: u.division.code,
            },
          }
        : {}),
    }));

    UserController.logSuccess("Get pending registrations", {
      count: response.length,
    });
    return UserController.sendSuccess(res, response);
  };

  // Approve or reject a GN registration
  static approveRegistration = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const id = req.params["id"];
    UserController.validateRequiredParams(req.params, ["id"]);

    const body: ApproveRegistrationDto = req.body;

    // Get the user performing the approval, or null if not authenticated
    const changedBy = (req as any).user?.id ?? null;

    // Verify user exists
    const user = await UserController.userRepository.findById(id!);
    if (!user) throw new NotFoundError("User not found");

    const newStatus = body.approved
      ? UserAccountStatusEnum.ACTIVE
      : UserAccountStatusEnum.REJECTED;

    const updated = await UserController.userRepository.updateStatus(
      id!,
      newStatus,
      changedBy,
      body.comment
    );

    UserController.logSuccess("Approve registration", {
      userId: id,
      approved: body.approved,
    });

    return UserController.sendSuccess(res, {
      id: updated.id,
      currentStatus: updated.currentStatus,
    });
  };

  
  static updateStatus = async (req: Request, res: Response) => {
    const id = req.params["id"];
    UserController.validateRequiredParams(req.params, ["id"]);

    // const body: UpdateUserDto = req.body;
    const body: UpdateUserDto = {
      currentStatus: req.body.currentStatus || req.body.status, // fallback to status
      comment: req.body.comment,
    };

    // Validate the status is provided and is valid
    if (!body.currentStatus) {
      throw new NotFoundError("Status is required");
    }

    // Validate that the status is one of the allowed values
    const allowedStatuses = Object.values(UserAccountStatusEnum);
    if (!allowedStatuses.includes(body.currentStatus)) {
      throw new NotFoundError(
        `Invalid status. Must be one of: ${allowedStatuses.join(", ")}`
      );
    }

    // Get the user performing the status update, or null if not authenticated
    const changedBy = (req as any).user?.id ?? null;

    console.log(
      "Updating status for user:",
      id,
      "to",
      body.currentStatus,
      "by",
      changedBy
    );

    // Verify user exists
    const user = await UserController.userRepository.findById(id!);
    if (!user) throw new NotFoundError("User not found");

    // Optional
    // For example, prevent changing status if user is not a GN
    if (user.role !== UserRole.GN) {
      throw new NotFoundError("Status can only be updated for GN users");
    }

    // Optional
    // For example, once rejected, maybe only allow reactivation by admin
    if (
      user.currentStatus === UserAccountStatusEnum.REJECTED &&
      body.currentStatus !== UserAccountStatusEnum.PENDING_APPROVAL &&
      body.currentStatus !== UserAccountStatusEnum.ACTIVE
    ) {
      throw new NotFoundError("Invalid status transition from REJECTED");
    }

    const updated = await UserController.userRepository.updateStatus(
      id!,
      body.currentStatus,
      changedBy,
      body.comment
    );

    UserController.logSuccess("Update user status", {
      userId: id,
      oldStatus: user.currentStatus,
      newStatus: body.currentStatus,
    });

    return UserController.sendSuccess(res, {
      id: updated.id,
      currentStatus: updated.currentStatus,
      message: `User status updated to ${body.currentStatus}`,
    });
  };

  // Get all active GNs
  static getAllGNs = async (
    _req: Request,
    res: Response
  ): Promise<Response> => {
    const gns = await UserController.userRepository.findGNUsers();

    const response: UserResponseDto[] = gns.map((u) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      phone: u.phone,
      role: u.role,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      currentStatus: u.currentStatus,
      ...(u.divisionId ? { divisionId: u.divisionId } : {}),
      ...(u.additionalData
        ? { additionalData: u.additionalData as Record<string, any> }
        : {}),
    }));

    UserController.logSuccess("Get all GNs", { count: response.length });
    return UserController.sendSuccess(res, response);
  };

  // Update GN profile (partial)
  static updateGN = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params["id"];
    UserController.validateRequiredParams(req.params, ["id"]);

    const updateData: UpdateUserDto = req.body;

    const existing = await UserController.userRepository.findById(id!);
    if (!existing) throw new NotFoundError("User not found");

    const updated = await UserController.userRepository.updateById(
      id!,
      updateData as any
    );

    const userResponse: UserResponseDto = {
      id: updated.id,
      email: updated.email,
      firstName: updated.firstName,
      lastName: updated.lastName,
      phone: updated.phone,
      role: updated.role,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      currentStatus: updated.currentStatus,
      ...(updated.divisionId ? { divisionId: updated.divisionId } : {}),
      ...(updated.additionalData
        ? { additionalData: updated.additionalData as Record<string, any> }
        : {}),
    };

    UserController.logSuccess("Update GN", { userId: id });
    return UserController.sendSuccess(res, userResponse);
  };

  // Reset password for a user (hashes password)
  static resetPassword = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const id = req.params["id"];
    UserController.validateRequiredParams(req.params, ["id"]);

    const body: ResetPasswordDto = req.body;
    UserController.validateRequiredFields(body, ["newPassword"]);

    const existing = await UserController.userRepository.findById(id!);
    if (!existing) throw new NotFoundError("User not found");

    const hashed = await bcrypt.hash(body.newPassword, 10);
    await UserController.userRepository.updatePassword(id!, hashed);

    UserController.logSuccess("Reset password", { userId: id });
    return UserController.sendSuccess(res, {
      message: "Password reset successful",
    });
  };
  private static userRepository = new UserRepository();

  // Get all users
  static getAllUsers = async (
    _req: Request,
    res: Response
  ): Promise<Response<UserListResponseDto>> => {
    const users = await UserController.userRepository.findAll();

    const userResponses: UserResponseDto[] = users.map((user) => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      currentStatus: "ACTIVE",
    }));

    UserController.logSuccess("Get all users", { count: userResponses.length });
    return UserController.sendSuccess(
      res,
      userResponses
    ) as Response<UserListResponseDto>;
  };

  // Get user by ID
  static getUserById = async (
    req: Request,
    res: Response
  ): Promise<Response<SingleUserResponseDto>> => {
    const { id } = req.params;

    UserController.validateRequiredParams(req.params, ["id"]);

    const user = await UserController.userRepository.findById(id!);

    if (!user) {
      throw new Error("User not found");
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
      currentStatus: user.currentStatus,
    };

    UserController.logSuccess("Get user by ID", { userId: id });
    return UserController.sendSuccess(
      res,
      userResponse
    ) as Response<SingleUserResponseDto>;
  };

  // Create new user
  static createUser = async (
    req: Request,
    res: Response
  ): Promise<Response<SingleUserResponseDto>> => {
    const userData: CreateUserDto = req.body;

    UserController.validateRequiredFields(req.body, ["email", "password"]);

    // Check if user already exists
    const existingUser = await UserController.userRepository.findByEmail(
      userData.email
    );
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // // Hash the password
    const passwordHash = await bcrypt.hash(userData.password, 10);

    // Map DTO to Prisma UserCreateInput
    const createInput = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      additionalData: userData.additionalData ?? {},
      passwordHash, // required by Prisma
      role: userData.role ?? "STANDARD", // default role
      divisionId: userData.divisionId ?? null,
      currentStatus:
        userData.role === UserRole.GN
          ? UserCurrentStatus.PENDING_APPROVAL
          : UserCurrentStatus.ACTIVE, // default status
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
      additionalData: user.additionalData ?? {},
      currentStatus: user.currentStatus,
      divisionId: user.divisionId ?? undefined,
    };

    UserController.logSuccess("Create user", {
      userId: user.id,
      email: userData.email,
    });
    return UserController.sendSuccess(
      res,
      userResponse,
      201
    ) as Response<SingleUserResponseDto>;
  };

static createGNWithSignature = async (req: Request, res: Response): Promise<Response<SingleUserResponseDto>> => {
  const userData: CreateUserDto = req.body;
  const file = req.file;

  UserController.validateRequiredFields(req.body, ["email", "password", "firstName", "lastName"]);
  if (!file) throw new NotFoundError('Signature file is required');

  // Check if user already exists
  const existingUser = await UserController.userRepository.findByEmail(userData.email);
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // Hash the password
  const passwordHash = await bcrypt.hash(userData.password, 10);

  // Parse additionalData if it's a string (from FormData)
  const parsedAdditionalData = typeof userData.additionalData === 'string' 
    ? JSON.parse(userData.additionalData) 
    : userData.additionalData || {};

  // Add signature URL to additional data
  parsedAdditionalData.signatureUrl = getFileUrl(file.filename);

  // Map DTO to Prisma UserCreateInput
  const createInput = {
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    phone: userData.phone,
    additionalData: parsedAdditionalData,
    passwordHash,
    role: userData.role ?? UserRole.GN,
    divisionId: userData.divisionId ?? null,
    currentStatus: UserCurrentStatus.PENDING_APPROVAL,
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
    additionalData: user.additionalData ?? {},
    currentStatus: user.currentStatus,
    divisionId: user.divisionId ?? undefined,
  };

  UserController.logSuccess("Create GN with signature", {
    userId: user.id,
    email: userData.email,
    signatureUrl: parsedAdditionalData.signatureUrl,
  });
  
  return UserController.sendSuccess(res, userResponse, 201) as Response<SingleUserResponseDto>;
};

  // Update user
  static updateUser = async (
    req: Request,
    res: Response
  ): Promise<Response<SingleUserResponseDto>> => {
    const { id } = req.params;
    const updateData: UpdateUserDto = req.body;

    UserController.validateRequiredParams(req.params, ["id"]);

    const user = await UserController.userRepository.updateById(
      id!,
      updateData
    );

    const userResponse: UserResponseDto = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      currentStatus: "ACTIVE",
    };

    UserController.logSuccess("Update user", { userId: id });
    return UserController.sendSuccess(
      res,
      userResponse
    ) as Response<SingleUserResponseDto>;
  };

  // Delete user
  static deleteUser = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const { id } = req.params;

    UserController.validateRequiredParams(req.params, ["id"]);

    await UserController.userRepository.deleteById(id!);

    UserController.logSuccess("Delete user", { userId: id });
    return res.status(204).send();
  };
}
