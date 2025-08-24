import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import notificationRoutes from './notification.routes';
import applicationRoutes from './application.routes';
import documentRoutes from './document.routes';
import wasamaRoutes from './wasama.routes';

const router = Router();

// Health check route
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/applications', applicationRoutes);
router.use('/documents', documentRoutes);
router.use('/wasamas', wasamaRoutes);
router.use('/notifications', notificationRoutes);

export default router;