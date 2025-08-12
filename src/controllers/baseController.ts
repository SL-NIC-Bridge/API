import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import { createError } from '../middleware/errorHandler';
import { SuccessResponseDto, ErrorResponseDto } from '../types/dto';

export abstract class BaseController {
  /**
   * Send a successful response
   */
  protected static sendSuccess<T>(res: Response, data: T, statusCode: number = 200): Response<SuccessResponseDto<T>> {
    const response: SuccessResponseDto<T> = {
      success: true,
      data,
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Send an error response
   */
  protected static sendError(res: Response, message: string, statusCode: number = 500, details?: string): Response<ErrorResponseDto> {
    const response: ErrorResponseDto = {
      success: false,
      error: {
        message,
        ...(details && { details }),
      },
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Handle async controller methods with error handling
   */
  protected static asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await fn(req, res, next);
      } catch (error) {
        logger.error('Controller error', {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          url: req.url,
          method: req.method,
        });

        if (error instanceof Error && 'statusCode' in error) {
          const appError = error as any;
          this.sendError(res, appError.message, appError.statusCode, appError.details);
          return;
        }

        this.sendError(res, 'Internal server error', 500);
      }
    };
  }

  /**
   * Validate required fields in request body
   */
  protected static validateRequiredFields(body: Record<string, any>, fields: string[]): void {
    const missingFields = fields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      throw createError(`Missing required fields: ${missingFields.join(', ')}`, 400);
    }
  }

  /**
   * Validate required parameters
   */
  protected static validateRequiredParams(params: Record<string, any>, fields: string[]): void {
    const missingParams = fields.filter(field => !params[field]);
    
    if (missingParams.length > 0) {
      throw createError(`Missing required parameters: ${missingParams.join(', ')}`, 400);
    }
  }

  /**
   * Log successful operation
   */
  protected static logSuccess(operation: string, details: Record<string, any> = {}): void {
    logger.info(`Operation successful: ${operation}`, details);
  }

  /**
   * Log failed operation
   */
  protected static logError(operation: string, error: any, details: Record<string, any> = {}): void {
    logger.error(`Operation failed: ${operation}`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      ...details,
    });
  }
} 