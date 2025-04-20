import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { sendResponse } from '../utils/response';
import ApiError from '../utils/ApiError';
import logger from '../config/logger';

export const errorConverter = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

export const errorHandler = (err: ApiError, req: Request, res: Response, next: NextFunction) => {
  let { statusCode, message } = err;
  if (process.env.NODE_ENV === 'production' && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = 'Internal Server Error';
  }

  res.locals.errorMessage = err.message;

  const response = {
    success: false,
    message,
    data: null,
  };

  if (process.env.NODE_ENV === 'development') {
    logger.error(err);
  }

  sendResponse(res, statusCode, message);
};
