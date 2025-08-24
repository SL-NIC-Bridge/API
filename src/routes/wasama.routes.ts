import { Router } from 'express';
import { WasamaController } from '../controllers/wasamaController';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/roleGuard';

const router = Router();

// Public routes for reading wasamas
router.get('/', asyncHandler(WasamaController.getWasamas));
router.get('/:id', asyncHandler(WasamaController.getWasama));

// Admin-only routes for managing wasamas
router.use(authenticateToken, requireAdmin);
router.post('/', asyncHandler(WasamaController.createWasama));
router.put('/:id', asyncHandler(WasamaController.updateWasama));
router.delete('/:id', asyncHandler(WasamaController.deleteWasama));
export default router;