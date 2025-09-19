import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/roleGuard';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// User notification routes
router.get('/', asyncHandler(NotificationController.getNotifications));
router.patch('/:id/read', asyncHandler(NotificationController.markAsRead));
router.patch('/read-all', asyncHandler(NotificationController.markAllAsRead));
router.delete('/:id', asyncHandler(NotificationController.deleteNotification));

// Admin route for sending notifications
router.post('/send', requireAdmin, asyncHandler(NotificationController.sendNotification));

export default router;