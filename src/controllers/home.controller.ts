import { Request, Response } from 'express';
import httpStatus from 'http-status';
import User from '../models/user.model';
import { sendResponse } from '../utils/response';

export const getHome = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      return sendResponse(res, httpStatus.NOT_FOUND, 'User not found');
    }
    sendResponse(res, httpStatus.OK, 'User details retrieved successfully', { user });
  } catch (error) {
    if (error instanceof Error) {
      sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, error.message);
    } else {
      sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong');
    }
  }
};
