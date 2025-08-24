import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerGNSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  nicNumber: z.string().regex(/^\d{9}[vVxX]|\d{12}$/, 'Invalid NIC number format'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(1, 'Address is required'),
  wasamaId: z.string().uuid('Invalid wasama ID'),
});

export const createApplicationSchema = z.object({
  type: z.string().min(1, 'Application type is required'),
  data: z.record(z.any()),
});
