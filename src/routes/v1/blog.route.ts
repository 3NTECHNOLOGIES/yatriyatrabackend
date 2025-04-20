import { Router } from 'express';
import {
  createBlogHandler,
  getBlogsHandler,
  getBlogHandler,
  updateBlogHandler,
  deleteBlogHandler,
  publishBlogHandler,
  saveBlogAsDraftHandler,
} from '../../controllers/blog.controller';
import validate from '../../middlewares/validate';
import {
  createBlogSchema,
  updateBlogSchema,
  blogIdSchema,
  paginationSchema,
  publishBlogSchema,
  saveDraftSchema,
} from '../../validations/blog.validation';
import auth from '../../middlewares/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Blogs
 *   description: Blog management
 */

/**
 * @swagger
 * /blogs:
 *   post:
 *     summary: Create a new blog
 *     description: Only admins can create blogs. The author is automatically set to the authenticated user.
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - category
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 description: Blog title
 *               category:
 *                 type: string
 *                 description: Category ID
 *               content:
 *                 type: string
 *                 description: Blog content
 *               featured:
 *                 type: boolean
 *                 description: Whether the blog is featured
 *                 default: false
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived, pending]
 *                 description: Blog status
 *                 default: draft
 *     responses:
 *       201:
 *         description: Blog created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User does not have admin privileges
 *
 *   get:
 *     summary: Get all blogs
 *     description: Retrieve a list of all blogs with pagination, searching, and filtering.
 *     tags: [Blogs]
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
 *           default: createdAt:desc
 *         description: Sort by field (format - field:order)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search text in blog titles
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Filter blogs by category ID
 *       - in: query
 *         name: createdAtFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter blogs created after this date (YYYY-MM-DD)
 *       - in: query
 *         name: createdAtTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter blogs created before this date (YYYY-MM-DD)
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *         description: Filter featured or non-featured blogs
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived, pending]
 *         description: Filter blogs by status
 *     responses:
 *       200:
 *         description: List of blogs retrieved successfully
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
 *                   example: Blogs retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     blogs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: 60d21b4667d0d8992e610c85
 *                           title:
 *                             type: string
 *                             example: How to build a Node.js API
 *                           category:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: 60d21b4667d0d8992e610c86
 *                               name:
 *                                 type: string
 *                                 example: Technology
 *                               slug:
 *                                 type: string
 *                                 example: technology
 *                           content:
 *                             type: string
 *                             example: This is the content of the blog post...
 *                           featured:
 *                             type: boolean
 *                             example: false
 *                           author:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: 60d21b4667d0d8992e610c87
 *                               name:
 *                                 type: string
 *                                 example: John Doe
 *                               email:
 *                                 type: string
 *                                 example: john@example.com
 *                           status:
 *                             type: string
 *                             enum: [draft, published, archived, pending]
 *                             example: published
 *                           views:
 *                             type: integer
 *                             example: 42
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
  .post(auth('admin'), validate(createBlogSchema), createBlogHandler)
  .get(validate(paginationSchema, 'query'), getBlogsHandler);

/**
 * @swagger
 * /blogs/draft:
 *   post:
 *     summary: Save a blog as draft
 *     description: Only admins can save blogs as drafts. The author is automatically set to the authenticated user.
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - category
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 description: Blog title
 *               category:
 *                 type: string
 *                 description: Category ID
 *               content:
 *                 type: string
 *                 description: Blog content
 *               featured:
 *                 type: boolean
 *                 description: Whether the blog is featured
 *                 default: false
 *     responses:
 *       201:
 *         description: Blog saved as draft successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User does not have admin privileges
 */
router.route('/draft').post(auth('admin'), validate(saveDraftSchema), saveBlogAsDraftHandler);

/**
 * @swagger
 * /blogs/{blogId}/publish:
 *   patch:
 *     summary: Publish a blog
 *     description: Only admins can publish blogs.
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *         description: The blog ID
 *     responses:
 *       200:
 *         description: Blog published successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User does not have admin privileges
 *       404:
 *         description: Blog not found
 */
router
  .route('/:blogId/publish')
  .patch(auth('admin'), validate(publishBlogSchema, 'params'), publishBlogHandler);

/**
 * @swagger
 * /blogs/{blogId}:
 *   get:
 *     summary: Get a blog by ID
 *     description: Retrieve a specific blog by its ID. View count is automatically incremented.
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *         description: The blog ID
 *     responses:
 *       200:
 *         description: Blog retrieved successfully
 *       404:
 *         description: Blog not found
 *
 *   put:
 *     summary: Update a blog
 *     description: Only admins can update blogs.
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *         description: The blog ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Blog title
 *               category:
 *                 type: string
 *                 description: Category ID
 *               content:
 *                 type: string
 *                 description: Blog content
 *               featured:
 *                 type: boolean
 *                 description: Whether the blog is featured
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived, pending]
 *                 description: Blog status
 *     responses:
 *       200:
 *         description: Blog updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User does not have admin privileges
 *       404:
 *         description: Blog not found
 *
 *   delete:
 *     summary: Delete a blog
 *     description: Only admins can delete blogs.
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *         description: The blog ID
 *     responses:
 *       200:
 *         description: Blog deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User does not have admin privileges
 *       404:
 *         description: Blog not found
 */
router
  .route('/:blogId')
  .get(validate(blogIdSchema, 'params'), getBlogHandler)
  .put(
    auth('admin'),
    validate(blogIdSchema, 'params'),
    validate(updateBlogSchema),
    updateBlogHandler,
  )
  .delete(auth('admin'), validate(blogIdSchema, 'params'), deleteBlogHandler);

export default router;
