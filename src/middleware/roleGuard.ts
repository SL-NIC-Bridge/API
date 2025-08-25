import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;

      if (!user) {
        throw new UnauthorizedError('Authentication required');
      }

      if (!allowedRoles.includes(user.role)) {
        throw new ForbiddenError('Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Specific role guards for convenience
export const requireAdmin = requireRole(['DS']);
export const requireGN = requireRole(['GN']);
export const requireGNOrAdmin = requireRole(['GN', 'DS']);