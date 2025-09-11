import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin, requireGNOrAdmin } from '../middleware/roleGuard';
import { uploadSingle } from '../utils/fileUpload';

const router = Router();

router.post('/',  asyncHandler(UserController.createUser));
router.post('/gn/with-signature',  uploadSingle('signature'), UserController.createGNWithSignature);

// All routes require authentication
router.use(authenticateToken);

// GN management routes (DS only)

router.get('/gn/pending', requireAdmin, asyncHandler(UserController.getPendingRegistrations));
router.get('/gn/all', requireGNOrAdmin, asyncHandler(UserController.getAllGNs));
router.put('/gn/:id', asyncHandler(UserController.updateGN));
router.post('/gn/:id/reset-password', requireAdmin, asyncHandler(UserController.resetPassword));
router.put('/gn/:id/status', requireAdmin, asyncHandler(UserController.updateStatus));


// Public user routes
router.get('/', asyncHandler(UserController.getAllUsers));
router.get('/:id', asyncHandler(UserController.getUserById));

// User CRUD (admin only)

router.put('/:id', requireAdmin, asyncHandler(UserController.updateUser));

export default router;