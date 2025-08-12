import { Router } from 'express';
import { UserController } from '../controllers';
import { validate } from '../middleware/validation';
import { createUserSchema, updateUserSchema, userIdSchema } from '../validation';

const router = Router();

// Get all users
router.get('/', UserController.getAllUsers);

// Get user by ID
router.get('/:id', validate({ params: userIdSchema }), UserController.getUserById);

// Create new user
router.post('/', validate({ body: createUserSchema }), UserController.createUser);

// Update user
router.put('/:id', validate({ params: userIdSchema, body: updateUserSchema }), UserController.updateUser);

// Delete user
router.delete('/:id', validate({ params: userIdSchema }), UserController.deleteUser);

export default router; 