import { Router } from 'express';
import { DivisionController } from '../controllers/divisionController';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/roleGuard';

const router = Router();

// Public routes for reading divisions
router.get('/', asyncHandler(DivisionController.getDivisions));
router.get('/:id', asyncHandler(DivisionController.getDivision));

// Admin-only routes for managing divisions
router.use(authenticateToken, requireAdmin);
router.post('/', asyncHandler(DivisionController.createDivision));
router.put('/:id', asyncHandler(DivisionController.updateDivision));
router.delete('/:id', asyncHandler(DivisionController.deleteDivision));

export default router;