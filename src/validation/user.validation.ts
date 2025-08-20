import Joi from 'joi';
import { UserRole } from '@prisma/client';

// Create user validation schema
export const createUserSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required',
  }),
  name: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name must not exceed 100 characters',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'any.required': 'Password is required',
  }),
  role: Joi.string().valid(...Object.values(UserRole)).optional().messages({
    'any.only': 'Role must be either USER or ADMIN',
  }),
});

// Update user validation schema
export const updateUserSchema = Joi.object({
  email: Joi.string().email().optional().messages({
    'string.email': 'Email must be a valid email address',
  }),
  name: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name must not exceed 100 characters',
  }),
  role: Joi.string().valid(...Object.values(UserRole)).optional().messages({
    'any.only': 'Role must be either USER or ADMIN',
  }),
});

// User ID validation schema
export const userIdSchema = Joi.object({
  id: Joi.string().required().messages({
    'any.required': 'User ID is required',
  }),
}); 