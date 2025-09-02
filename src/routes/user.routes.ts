// import { Router } from 'express';
// import { UserController } from '../controllers/userController';
// import { asyncHandler } from '../middleware/errorHandler';
// import { authenticateToken } from '../middleware/auth';
// import { requireAdmin, requireGNOrAdmin } from '../middleware/roleGuard';

// const router = Router();

// // All routes require authentication
// router.use(authenticateToken);

// // Public user routes
// router.get('/', asyncHandler(UserController.getAllUsers));
// router.get('/:id', asyncHandler(UserController.getUserById));
// router.post('/',  asyncHandler(UserController.createUser));

// // GN management routes (DS only)
// router.get('/gn/pending', requireAdmin, asyncHandler(UserController.getPendingRegistrations));
// router.post('/gn/:id/approve', requireAdmin, asyncHandler(UserController.approveRegistration));
// router.get('/gn/all', requireGNOrAdmin, asyncHandler(UserController.getAllGNs));
// router.put('/gn/:id', requireAdmin, asyncHandler(UserController.updateGN));
// router.post('/gn/:id/reset-password', requireAdmin, asyncHandler(UserController.resetPassword));

// // User CRUD (admin only)

// router.put('/:id', requireAdmin, asyncHandler(UserController.updateUser));

// export default router;

import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin, requireGNOrAdmin } from '../middleware/roleGuard';

const router = Router();

router.post('/',  asyncHandler(UserController.createUser));

// All routes require authentication
router.use(authenticateToken);

// Public user routes
router.get('/', asyncHandler(UserController.getAllUsers));
router.get('/:id', asyncHandler(UserController.getUserById));


// GN management routes (DS only)
router.get('/gn/pending', requireAdmin, asyncHandler(UserController.getPendingRegistrations));
router.post('/gn/:id/approve', requireAdmin, asyncHandler(UserController.approveRegistration));
router.get('/gn/all', requireGNOrAdmin, asyncHandler(UserController.getAllGNs));
router.put('/gn/:id', requireAdmin, asyncHandler(UserController.updateGN));
router.post('/gn/:id/reset-password', requireAdmin, asyncHandler(UserController.resetPassword));

// User CRUD (admin only)

router.put('/:id', requireAdmin, asyncHandler(UserController.updateUser));

export default router;