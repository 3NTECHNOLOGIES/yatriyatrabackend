import { Router } from 'express';
import {
  getUsersHandler,
  getUserHandler,
  updateUserHandler,
  deleteUserHandler,
} from '../../controllers/user.controller';
import validate from '../../middlewares/validate';
import {
  userIdSchema,
  updateUserSchema,
  userPaginationSchema,
} from '../../validations/user.validation';
import auth from '../../middlewares/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management - Admin only
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Only admins can retrieve all users. Includes pagination, search and filtering.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
 *         description: Search text for name or email (case-insensitive)
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, admin]
 *         description: Filter by user role
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by user status
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
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
 *                   example: Users retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: 60d21b4667d0d8992e610c85
 *                           name:
 *                             type: string
 *                             example: John Doe
 *                           email:
 *                             type: string
 *                             example: john@example.com
 *                           role:
 *                             type: string
 *                             enum: [user, admin]
 *                             example: user
 *                           status:
 *                             type: string
 *                             enum: [active, inactive]
 *                             example: active
 *                           isEmailVerified:
 *                             type: boolean
 *                             example: false
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
 *                       example: 3
 *                     totalResults:
 *                       type: integer
 *                       example: 30
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User does not have admin privileges
 */
router.route('/').get(auth('admin'), validate(userPaginationSchema, 'query'), getUsersHandler);

/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: Get a user by ID
 *     description: Only admins can access user information.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
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
 *                   example: User retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: 60d21b4667d0d8992e610c85
 *                         name:
 *                           type: string
 *                           example: John Doe
 *                         email:
 *                           type: string
 *                           example: john@example.com
 *                         role:
 *                           type: string
 *                           enum: [user, admin]
 *                           example: user
 *                         status:
 *                           type: string
 *                           enum: [active, inactive]
 *                           example: active
 *                         isEmailVerified:
 *                           type: boolean
 *                           example: false
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User does not have admin privileges
 *       404:
 *         description: User not found
 *
 *   put:
 *     summary: Update a user
 *     description: Only admins can update users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 description: User's role
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 description: User's status
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User does not have admin privileges
 *       404:
 *         description: User not found
 *
 *   delete:
 *     summary: Delete a user
 *     description: Only admins can delete users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User does not have admin privileges
 *       404:
 *         description: User not found
 */
router
  .route('/:userId')
  .get(auth('admin'), validate(userIdSchema, 'params'), getUserHandler)
  .put(
    auth('admin'),
    validate(userIdSchema, 'params'),
    validate(updateUserSchema),
    updateUserHandler,
  )
  .delete(auth('admin'), validate(userIdSchema, 'params'), deleteUserHandler);

export default router;
