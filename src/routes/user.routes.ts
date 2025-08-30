// import { Router } from 'express';
// import { UserController } from '../controllers';
// import { validate } from '../middleware/validation';
// import { createUserSchema, updateUserSchema, userIdSchema } from '../validation';

// const router = Router();

// // Get all users
// router.get('/', UserController.getAllUsers);

// // Get user by ID
// router.get('/:id', validate({ params: userIdSchema }), UserController.getUserById);

// // Create new user
// router.post('/', validate({ body: createUserSchema }), UserController.createUser);

// // Update user
// router.put('/:id', validate({ params: userIdSchema, body: updateUserSchema }), UserController.updateUser);

// // Delete user
// router.delete('/:id', validate({ params: userIdSchema }), UserController.deleteUser);

// export default router; 


import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin, requireGNOrAdmin } from '../middleware/roleGuard';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Public user routes
router.get('/', asyncHandler(UserController.getAllUsers));
router.get('/:id', asyncHandler(UserController.getUserById));
router.post('/',  asyncHandler(UserController.createUser));

// GN management routes (DS only)
router.get('/gn/pending', requireAdmin, asyncHandler(UserController.getPendingRegistrations));
router.post('/gn/:id/approve', requireAdmin, asyncHandler(UserController.approveRegistration));
router.get('/gn/all', requireGNOrAdmin, asyncHandler(UserController.getAllGNs));
router.put('/gn/:id', requireAdmin, asyncHandler(UserController.updateGN));
router.post('/gn/:id/reset-password', requireAdmin, asyncHandler(UserController.resetPassword));

// User CRUD (admin only)

router.put('/:id', requireAdmin, asyncHandler(UserController.updateUser));

export default router;