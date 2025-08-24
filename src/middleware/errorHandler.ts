// import { Request, Response, NextFunction } from 'express';
// import logger from '../config/logger';

// export interface AppError extends Error {
//   statusCode?: number;
//   isOperational?: boolean;
//   details?: string[] | undefined;
// }

// export const createError = (message: string, statusCode: number = 500, details?: string[]): AppError => {
//   const error = new Error(message) as AppError;
//   error.statusCode = statusCode;
//   error.isOperational = true;
//   error.details = details;
//   return error;
// };

// export const errorHandler = (
//   error: AppError,
//   req: Request,
//   res: Response,
//   _next: NextFunction
// ): void => {
//   const statusCode = error.statusCode || 500;
//   const message = error.message || 'Internal Server Error';

//   // Log error
//   logger.error('Error Handler', {
//     error: message,
//     stack: error.stack,
//     statusCode,
//     url: req.url,
//     method: req.method,
//     details: error.details,
//   });

//   // Send error response
//   res.status(statusCode).json({
//     success: false,
//     error: {
//       message: process.env['NODE_ENV'] === 'production' && statusCode === 500 
//         ? 'Internal Server Error' 
//         : message,
//       ...(error.details && { details: error.details.join(', ') }),
//       ...(process.env['NODE_ENV'] === 'development' && { stack: error.stack }),
//     },
//   });
// };

// export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
//   const error = createError(`Route ${req.originalUrl} not found`, 404);
//   next(error);
// }; 



import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/errors';
import { logger } from '../config/logger';
import { ErrorResponseDto } from '../types/dto/common.dto';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  logger.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Handle known API errors
  if (error instanceof ApiError) {
    const response: ErrorResponseDto = {
      success: false,
      error: {
        message: error.message,
        code: error.code,
        details: error.details,
      },
    };
    return res.status(error.statusCode).json(response);
  }

  // Handle Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any;
    let message = 'Database error occurred';
    let statusCode = 400;

    switch (prismaError.code) {
      case 'P2002':
        message = 'A record with this information already exists';
        statusCode = 409;
        break;
      case 'P2025':
        message = 'Record not found';
        statusCode = 404;
        break;
      case 'P2003':
        message = 'Foreign key constraint failed';
        statusCode = 400;
        break;
      default:
        message = 'Database operation failed';
    }

    const response: ErrorResponseDto = {
      success: false,
      error: {
        message,
        code: 'DATABASE_ERROR',
        details: prismaError.message,
      },
    };
    return res.status(statusCode).json(response);
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    const response: ErrorResponseDto = {
      success: false,
      error: {
        message: error.message,
        code: 'VALIDATION_ERROR',
      },
    };
    return res.status(400).json(response);
  }

  // Handle unknown errors
  const response: ErrorResponseDto = {
    success: false,
    error: {
      message: process.env['NODE_ENV'] === 'production' ? 'Internal server error' : error.message,
      code: 'INTERNAL_ERROR',
      details: process.env['NODE_ENV'] === 'production' ? undefined : error.stack,
    },
  };
  return res.status(500).json(response);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};