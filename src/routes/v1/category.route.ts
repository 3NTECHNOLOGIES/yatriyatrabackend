import { Router } from 'express';
import {
  createCategoryHandler,
  getCategoriesHandler,
  getCategoryHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
} from '../../controllers/category.controller';
import validate from '../../middlewares/validate';
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdSchema,
  paginationSchema,
} from '../../validations/category.validation';
import auth from '../../middlewares/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management
 */

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new category
 *     description: Only admins can create categories.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 description: Category name
 *               slug:
 *                 type: string
 *                 description: Category slug (URL-friendly identifier)
 *               description:
 *                 type: string
 *                 description: Category description
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User does not have admin privileges
 *
 *   get:
 *     summary: Get all categories
 *     description: Retrieve a list of all categories with pagination.
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Maximum number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: name:asc
 *         description: Sort by field (format - field:order)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search text for category name (case-insensitive)
 *     responses:
 *       200:
 *         description: List of categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Categories retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: 60d21b4667d0d8992e610c85
 *                           name:
 *                             type: string
 *                             example: Electronics
 *                           slug:
 *                             type: string
 *                             example: electronics
 *                           description:
 *                             type: string
 *                             example: Electronic devices and accessories
 *                           postCount:
 *                             type: integer
 *                             example: 42
 *                             description: Number of blog posts in this category
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *                     totalResults:
 *                       type: integer
 *                       example: 48
 */
router
  .route('/')
  .post(auth('admin'), validate(createCategorySchema), createCategoryHandler)
  .get(validate(paginationSchema, 'query'), getCategoriesHandler);

/**
 * @swagger
 * /categories/{categoryId}:
 *   get:
 *     summary: Get a category by ID
 *     description: Retrieve a specific category by its ID.
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: The category ID
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *       404:
 *         description: Category not found
 *
 *   put:
 *     summary: Update a category
 *     description: Only admins can update categories.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: The category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Category name
 *               slug:
 *                 type: string
 *                 description: Category slug (URL-friendly identifier)
 *               description:
 *                 type: string
 *                 description: Category description
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User does not have admin privileges
 *       404:
 *         description: Category not found
 *
 *   delete:
 *     summary: Delete a category
 *     description: Only admins can delete categories.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: The category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User does not have admin privileges
 *       404:
 *         description: Category not found
 */
router
  .route('/:categoryId')
  .get(validate(categoryIdSchema, 'params'), getCategoryHandler)
  .put(
    auth('admin'),
    validate(categoryIdSchema, 'params'),
    validate(updateCategorySchema),
    updateCategoryHandler,
  )
  .delete(auth('admin'), validate(categoryIdSchema, 'params'), deleteCategoryHandler);

export default router;
