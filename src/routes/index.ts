import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import notificationRoutes from './notification.routes';
import applicationRoutes from './application.routes';
import documentRoutes from './document.routes';
import divisionRoutes from './division.routes';
import { version } from '../../package.json';

const router = Router();

// Health check route
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      version,
    },
  });
});

// public routes
router.use('/auth', authRoutes);

// secure routes
router.use('/users', userRoutes);
router.use('/applications', applicationRoutes);
router.use('/documents', documentRoutes);
router.use('/divisions', divisionRoutes);
router.use('/notifications', notificationRoutes);

export default router;