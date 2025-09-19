import { Router } from 'express';
import { DivisionController } from '../controllers/divisionController';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/roleGuard';

const router = Router();

// Public routes for reading divisions
router.get('/', asyncHandler(DivisionController.getDivisions));
router.get('/:id', asyncHandler(DivisionController.getDivision));

// Email service health check (public for monitoring)
router.get('/email/health', asyncHandler(DivisionController.emailHealthCheck));

// Admin-only routes for managing divisions
router.use(authenticateToken, requireAdmin);

// CRUD operations
router.post('/', asyncHandler(DivisionController.createDivision));
router.put('/:id', asyncHandler(DivisionController.updateDivision));
router.delete('/:id', asyncHandler(DivisionController.deleteDivision));

// Email testing endpoint (admin only)
router.post('/email/test', asyncHandler(DivisionController.testEmail));

export default router;