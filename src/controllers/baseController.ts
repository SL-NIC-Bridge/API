// import { Request, Response, NextFunction } from 'express';
// import logger from '../config/logger';
// import { createError } from '../middleware/errorHandler';
// import { SuccessResponseDto, ErrorResponseDto } from '../types/dto';

// export abstract class BaseController {
//   /**
//    * Send a successful response
//    */
//   protected static sendSuccess<T>(res: Response, data: T, statusCode: number = 200): Response<SuccessResponseDto<T>> {
//     const response: SuccessResponseDto<T> = {
//       success: true,
//       data,
//     };
//     return res.status(statusCode).json(response);
//   }

//   /**
//    * Send an error response
//    */
//   protected static sendError(res: Response, message: string, statusCode: number = 500, details?: string): Response<ErrorResponseDto> {
//     const response: ErrorResponseDto = {
//       success: false,
//       error: {
//         message,
//         ...(details && { details }),
//       },
//     };
//     return res.status(statusCode).json(response);
//   }

//   /**
//    * Handle async controller methods with error handling
//    */
//   protected static asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
//     return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//       try {
//         await fn(req, res, next);
//       } catch (error) {
//         logger.error('Controller error', {
//           error: error instanceof Error ? error.message : 'Unknown error',
//           stack: error instanceof Error ? error.stack : undefined,
//           url: req.url,
//           method: req.method,
//         });

//         if (error instanceof Error && 'statusCode' in error) {
//           const appError = error as any;
//           this.sendError(res, appError.message, appError.statusCode, appError.details);
//           return;
//         }

//         this.sendError(res, 'Internal server error', 500);
//       }
//     };
//   }

//   /**
//    * Validate required fields in request body
//    */
//   protected static validateRequiredFields(body: Record<string, any>, fields: string[]): void {
//     const missingFields = fields.filter(field => !body[field]);
    
//     if (missingFields.length > 0) {
//       throw createError(`Missing required fields: ${missingFields.join(', ')}`, 400);
//     }
//   }

//   /**
//    * Validate required parameters
//    */
//   protected static validateRequiredParams(params: Record<string, any>, fields: string[]): void {
//     const missingParams = fields.filter(field => !params[field]);
    
//     if (missingParams.length > 0) {
//       throw createError(`Missing required parameters: ${missingParams.join(', ')}`, 400);
//     }
//   }

//   /**
//    * Log successful operation
//    */
//   protected static logSuccess(operation: string, details: Record<string, any> = {}): void {
//     logger.info(`Operation successful: ${operation}`, details);
//   }

//   /**
//    * Log failed operation
//    */
//   protected static logError(operation: string, error: any, details: Record<string, any> = {}): void {
//     logger.error(`Operation failed: ${operation}`, {
//       error: error instanceof Error ? error.message : 'Unknown error',
//       ...details,
//     });
//   }
// } 


import { Response } from 'express';
import { logger } from '../config/logger';
import { ApiError, ValidationError } from '../utils/errors';
import {
  SuccessResponseDto,
  ErrorResponseDto,
  PaginatedResponseDto,
  PaginationDto,
} from '../types/dto/common.dto';

export abstract class BaseController {
  // Success response helper
  protected static sendSuccess<T>(
    res: Response,
    data: T,
    statusCode: number = 200
  ): Response<SuccessResponseDto<T>> {
    const response: SuccessResponseDto<T> = {
      success: true,
      data,
    };
    return res.status(statusCode).json(response);
  }

  // Paginated success response helper
  protected static sendPaginatedSuccess<T>(
    res: Response,
    data: T[],
    pagination: PaginationDto,
    statusCode: number = 200
  ): Response<PaginatedResponseDto<T>> {
    const response: PaginatedResponseDto<T> = {
      success: true,
      data,
      pagination,
    };
    return res.status(statusCode).json(response);
  }

  // Error response helper
  protected static sendError(
    res: Response,
    message: string,
    statusCode: number = 500,
    code?: string,
    details?: string
  ): Response {
    const response: ErrorResponseDto = {
      success: false,
      error: {
        message,
        code: code ?? undefined,
        details: details ?? undefined,
      },
    };
    return res.status(statusCode).json(response);
  }

  // Validation helper
  protected static validateRequiredFields(body: any, requiredFields: string[]): void {
    const missingFields = requiredFields.filter((field) => !body[field]);
    if (missingFields.length > 0) {
      throw new ValidationError(
        `Missing required fields: ${missingFields.join(', ')}`,
        `Required fields: ${requiredFields.join(', ')}`
      );
    }
  }

  // Parameter validation helper
  protected static validateRequiredParams(params: any, requiredParams: string[]): void {
    const missingParams = requiredParams.filter((param) => !params[param]);
    if (missingParams.length > 0) {
      throw new ValidationError(
        `Missing required parameters: ${missingParams.join(', ')}`,
        `Required parameters: ${requiredParams.join(', ')}`
      );
    }
  }

  // Pagination helper
  protected static getPaginationParams(query: any): { page: number; limit: number } {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
    return { page, limit };
  }

  // Calculate pagination info
  protected static calculatePagination(page: number, limit: number, total: number): PaginationDto {
    const totalPages = Math.ceil(total / limit);
    return {
      page,
      limit,
      total,
      totalPages,
    };
  }

  // Logging helpers
  protected static logSuccess(action: string, data?: any): void {
    logger.info(`${action} - Success`, data);
  }

  protected static logError(action: string, error: any, data?: any): void {
    logger.error(`${action} - Error`, {
      error: error.message,
      stack: error.stack,
      ...data,
    });
  }

  // Filter helper for search functionality
  protected static buildSearchFilter(search?: string, searchFields: string[] = []): any {
    if (!search || searchFields.length === 0) return {};
    return {
      OR: searchFields.map((field) => ({
        [field]: {
          contains: search,
          mode: 'insensitive',
        },
      })),
    };
  }

  // Sort helper
  protected static buildSortOrder(sortBy?: string, sortOrder?: string): any {
    if (!sortBy) return { createdAt: 'desc' };
    return {
      [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc',
    };
  }
}
