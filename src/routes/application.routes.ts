import { Router } from 'express';
import { ApplicationController } from '../controllers/applicationController';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';
import { requireGNOrAdmin } from '../middleware/roleGuard';
import { uploadSingle } from '../utils/fileUpload';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Application routes
router.post('/', asyncHandler(ApplicationController.createApplication));
router.get('/', asyncHandler(ApplicationController.getApplications));
router.get('/division/:id', asyncHandler(ApplicationController.getDivisionApplications));
router.get('/current', asyncHandler(ApplicationController.getCurrentApplication));
router.get('/:id', asyncHandler(ApplicationController.getApplication));
router.patch('/:id/status', requireGNOrAdmin, asyncHandler(ApplicationController.updateStatus));
router.post('/sign', requireGNOrAdmin, uploadSingle('signature'), asyncHandler(ApplicationController.signApplication));
router.get('/:id/audit-logs', requireGNOrAdmin, asyncHandler(ApplicationController.getAuditLogs));
router.get('/audit-logs/:id', requireGNOrAdmin, asyncHandler(ApplicationController.getAuditLogs));

// Email notification routes
router.post('/:id/resend-notification', requireGNOrAdmin, asyncHandler(ApplicationController.resendNotification));

export default router;