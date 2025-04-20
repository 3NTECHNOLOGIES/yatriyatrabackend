import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { getUsers, getUserById, updateUserById, deleteUserById } from '../services/user.service';
import { sendResponse } from '../utils/response';

/**
 * Get all users with pagination, search and filtering
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const getUsersHandler = async (req: Request, res: Response) => {
  try {
    const { page, limit, sortBy, search, role, status } = req.query;

    const options = {
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      sortBy: sortBy as string,
      search: search as string,
      role: role as string,
      status: status as string,
    };

    const result = await getUsers(options);
    sendResponse(res, httpStatus.OK, 'Users retrieved successfully', result);
  } catch (error) {
    sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong');
  }
};

/**
 * Get user by ID
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const getUserHandler = async (req: Request, res: Response) => {
  try {
    const user = await getUserById(req.params.userId);
    sendResponse(res, httpStatus.OK, 'User retrieved successfully', { user });
  } catch (error) {
    if (error instanceof Error) {
      sendResponse(
        res,
        error.message === 'User not found' ? httpStatus.NOT_FOUND : httpStatus.BAD_REQUEST,
        error.message,
      );
    } else {
      sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong');
    }
  }
};

/**
 * Update user by ID
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const updateUserHandler = async (req: Request, res: Response) => {
  try {
    const user = await updateUserById(req.params.userId, req.body);
    sendResponse(res, httpStatus.OK, 'User updated successfully', { user });
  } catch (error) {
    if (error instanceof Error) {
      sendResponse(
        res,
        error.message === 'User not found' ? httpStatus.NOT_FOUND : httpStatus.BAD_REQUEST,
        error.message,
      );
    } else {
      sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong');
    }
  }
};

/**
 * Delete user by ID
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const deleteUserHandler = async (req: Request, res: Response) => {
  try {
    await deleteUserById(req.params.userId);
    sendResponse(res, httpStatus.OK, 'User deleted successfully');
  } catch (error) {
    if (error instanceof Error) {
      sendResponse(
        res,
        error.message === 'User not found' ? httpStatus.NOT_FOUND : httpStatus.BAD_REQUEST,
        error.message,
      );
    } else {
      sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong');
    }
  }
};
