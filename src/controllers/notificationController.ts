import { Request, Response } from 'express';
import { NotFoundError, UnauthorizedError } from '../utils/errors';
import { BaseController } from './baseController';
import { NotificationRepository } from '../repositories/notificationRepository';
import { NotificationResponseDto } from '../types/dto/notification.dto';

export class NotificationController extends BaseController {
  private static notificationRepository = new NotificationRepository();

  // Send Notification
  static sendNotification = async (req: Request, res: Response): Promise<Response> => {
    const { userId, title, message, type, data } = req.body;

    if (!userId || !title || !message) {
      throw new NotFoundError('Missing required fields: userId, title, message');
    }

    const notification = await NotificationController.notificationRepository.create({
      userId,
      title,
      message,
      type,
      data,
    });

    NotificationController.logSuccess('Notification sent', {
      userId,
      notificationId: notification.id,
    });

    return NotificationController.sendSuccess(res, notification);
  };

  // Get all notifications for user
  static getNotifications = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) throw new UnauthorizedError('User not authenticated');

    const notifications = await NotificationController.notificationRepository.findByUserId(userId);

const notificationResponse: NotificationResponseDto[] = notifications.map((n) => ({
  id: n.id,
  userId: n.userId,
  title: n.title,
  message: n.message,
  type: n.type ?? "", // fallback to empty string
  data: n.data,
  isRead: n.isRead,
  createdAt: n.createdAt,
}));


    NotificationController.logSuccess('Fetched notifications', {
      userId,
      count: notificationResponse.length,
    });

    return NotificationController.sendSuccess(res, notificationResponse);
  };

  // Mark a single notification as read
  static markAsRead = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) throw new UnauthorizedError('User not authenticated');

    NotificationController.validateRequiredParams(req.params, ['id']);
    const id = req.params['id'];
    if (!id) throw new NotFoundError('Notification ID is required');

    const notification = await NotificationController.notificationRepository.markAsRead(id);

    if (!notification) throw new NotFoundError('Notification not found');

    NotificationController.logSuccess('Notification marked as read', {
      notificationId: id,
      userId,
    });

    return NotificationController.sendSuccess(res, { message: 'Notification marked as read' });
  };

  // Mark all notifications as read for user
  static markAllAsRead = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) throw new UnauthorizedError('User not authenticated');

    await NotificationController.notificationRepository.markAllAsRead(userId);

    NotificationController.logSuccess('All notifications marked as read', { userId });

    return NotificationController.sendSuccess(res, { message: 'All notifications marked as read' });
  };

  // Delete a single notification
  static deleteNotification = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) throw new UnauthorizedError('User not authenticated');

    NotificationController.validateRequiredParams(req.params, ['id']);
    const id = req.params['id'];
    if (!id) throw new NotFoundError('Notification ID is required');

    await NotificationController.notificationRepository.deleteById(id);

    NotificationController.logSuccess('Notification deleted', { notificationId: id, userId });

    return NotificationController.sendSuccess(res, { message: 'Notification deleted successfully' });
  };

  // Delete all notifications for user
  static deleteAllNotifications = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) throw new UnauthorizedError('User not authenticated');

    await NotificationController.notificationRepository.deleteAll(userId);

    NotificationController.logSuccess('All notifications deleted', { userId });

    return NotificationController.sendSuccess(res, { message: 'All notifications deleted successfully' });
  };
}
