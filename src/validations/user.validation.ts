import { z } from 'zod';

export const userIdSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

export const updateUserSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long').optional(),
    email: z.string().email('Invalid email format').optional(),
    role: z.enum(['user', 'admin'] as const).optional(),
    status: z.enum(['active', 'inactive'] as const).optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export const userPaginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 10)),
  sortBy: z.string().optional(),
  search: z.string().optional(),
  role: z.enum(['user', 'admin'] as const).optional(),
  status: z.enum(['active', 'inactive'] as const).optional(),
});
