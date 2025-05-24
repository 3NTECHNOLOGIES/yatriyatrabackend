import { z } from 'zod';
import { BlogStatus } from '../interfaces/blog.interface';

export const createBlogSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  category: z.string().min(1, 'Category ID is required'),
  content: z.string().min(1, 'Content is required'),
  featured: z.preprocess(
    val => (val === 'true' ? true : val === 'false' ? false : val),
    z.boolean().optional(),
  ),
  status: z.preprocess(
    val => (typeof val === 'string' ? val : undefined),
    z.nativeEnum(BlogStatus).default(BlogStatus.DRAFT).optional(),
  ),
  coverImage: z.any().optional(),
});

export const updateBlogSchema = z
  .object({
    title: z.string().min(1, 'Title is required').max(200, 'Title is too long').optional(),
    category: z.string().min(1, 'Category ID is required').optional(),
    content: z.string().min(1, 'Content is required').optional(),
    featured: z.preprocess(
      val => (val === 'true' ? true : val === 'false' ? false : val),
      z.boolean().optional(),
    ),
    status: z.preprocess(
      val => (typeof val === 'string' ? val : undefined),
      z.nativeEnum(BlogStatus).optional(),
    ),
    coverImage: z.any().optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export const publishBlogSchema = z.object({
  blogId: z.string().min(1, 'Blog ID is required'),
});

export const saveDraftSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  category: z.string().min(1, 'Category ID is required'),
  content: z.string().min(1, 'Content is required'),
  featured: z.preprocess(
    val => (val === 'true' ? true : val === 'false' ? false : val),
    z.boolean().optional(),
  ),
  coverImage: z.any().optional(),
});

export const blogIdSchema = z.object({
  blogId: z.string().min(1, 'Blog ID is required'),
});

export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : undefined)),
  limit: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : undefined)),
  sortBy: z.string().optional(),
  orderBy: z.string().optional(),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  createdAtFrom: z
    .string()
    .optional()
    .transform(val => (val ? new Date(val) : undefined)),
  createdAtTo: z
    .string()
    .optional()
    .transform(val => (val ? new Date(val) : undefined)),
  featured: z
    .string()
    .optional()
    .transform(val => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }),
  status: z.string().optional(),
});
