import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { asyncHandler } from '../middleware/errorHandler';
import { authLimiter } from '../middleware/rateLimiter';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/login', authLimiter, asyncHandler(AuthController.login));
router.post('/register', authLimiter, asyncHandler(AuthController.register));
router.post('/refresh-token', asyncHandler(AuthController.refreshToken));

// Protected routes
router.get('/me', authenticateToken, asyncHandler(AuthController.getCurrentUser));
router.patch('/me', authenticateToken, asyncHandler(AuthController.updateProfile));
router.post('/logout', authenticateToken, asyncHandler(AuthController.logout));
router.patch('/change-password', authenticateToken, asyncHandler(AuthController.changePassword));

export default router;