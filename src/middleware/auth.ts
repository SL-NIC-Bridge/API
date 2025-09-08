import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../utils/errors';
import { verifyAccessToken } from '../utils/jwt';

//Simple auth middleware for now (will implement JWT later)
export const authenticateToken = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    // For now, just check for a user ID in headers (temporary approach)
     //const userId = req.headers['x-user-id'];
     //const userRole = req.headers['x-user-role'];
    const token = req.headers['authorization']?.toString().replace('Bearer ', '');
    if (!token) {
      throw new UnauthorizedError('Access token is required');
    }

    const {userId, role, email} = verifyAccessToken(token);

    if (!userId) {
      throw new UnauthorizedError('Authentication required');
    }

    (req as any).user = {
      userId,
      role,
      email,
    };
    console.log('Authenticated user:', (req as any).user);

    next();
  } catch (error) {
    next(error);
  }
};



// Optional authentication (user may or may not be authenticated)
export const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const userId = req.headers['x-user-id'];
    const userRole = req.headers['x-user-role'];

    if (userId) {
      (req as any).user = {
        id: userId,
        role: userRole,
      };
    }

    next();
  } catch (error) {
    next(error);
  }
};