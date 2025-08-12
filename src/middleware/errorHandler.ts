import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  details?: string[] | undefined;
}

export const createError = (message: string, statusCode: number = 500, details?: string[]): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  error.details = details;
  return error;
};

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Log error
  logger.error('Error Handler', {
    error: message,
    stack: error.stack,
    statusCode,
    url: req.url,
    method: req.method,
    details: error.details,
  });

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      message: process.env['NODE_ENV'] === 'production' && statusCode === 500 
        ? 'Internal Server Error' 
        : message,
      ...(error.details && { details: error.details.join(', ') }),
      ...(process.env['NODE_ENV'] === 'development' && { stack: error.stack }),
    },
  });
};

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  const error = createError(`Route ${req.originalUrl} not found`, 404);
  next(error);
}; 