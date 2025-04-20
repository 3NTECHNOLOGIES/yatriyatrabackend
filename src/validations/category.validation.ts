import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  slug: z.string().min(1, 'Slug is required').max(100, 'Slug is too long'),
  description: z.string().min(1, 'Description is required'),
});

export const updateCategorySchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long').optional(),
    slug: z.string().min(1, 'Slug is required').max(100, 'Slug is too long').optional(),
    description: z.string().min(1, 'Description is required').optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export const categoryIdSchema = z.object({
  categoryId: z.string().min(1, 'Category ID is required'),
});

export const paginationSchema = z.object({
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
});
