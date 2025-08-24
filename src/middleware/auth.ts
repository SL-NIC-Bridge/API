// import { Request, Response, NextFunction } from 'express';


// import { RequestUser } from '../types';
// import { UnauthorizedError } from '@/utils/errors/UnauthorizedError';
// import { verifyAccessToken } from '@/utils/jwt';

// declare global {
//   namespace Express {
//     interface Request {
//       user?: RequestUser;
//     }
//   }
// }

// export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const token = req.headers.authorization?.replace('Bearer ', '');
    
//     if (!token) {
//       throw new UnauthorizedError('Access token is required');
//     }

//     const decoded = verifyAccessToken(token);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     next(error);
//   }
// };

import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../utils/errors';

// Simple auth middleware for now (will implement JWT later)
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // For now, just check for a user ID in headers (temporary approach)
    const userId = req.headers['x-user-id'];
    const userRole = req.headers['x-user-role'];

    if (!userId) {
      throw new UnauthorizedError('Authentication required');
    }

    // Attach user info to request (will be replaced with proper JWT implementation)
    (req as any).user = {
      id: userId,
      role: userRole,
    };

    next();
  } catch (error) {
    next(error);
  }
};

// Optional authentication (user may or may not be authenticated)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
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