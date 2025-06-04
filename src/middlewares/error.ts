import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { sendResponse } from '../utils/response';
import ApiError from '../utils/ApiError';
import logger from '../config/logger';

export const errorConverter = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = err;

  // Log the original error for debugging
  if (process.env.NODE_ENV === 'development') {
    logger.error('Original error in errorConverter:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
      url: req.originalUrl,
      method: req.method,
    });
  }

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

  // Safely set error message
  try {
    res.locals.errorMessage = err.message;
  } catch (e) {
    logger.error('Error setting res.locals.errorMessage:', e);
  }

  const response = {
    success: false,
    message,
    data: null,
  };

  // Enhanced error logging for development
  if (process.env.NODE_ENV === 'development') {
    logger.error('Error handler - Full details:', {
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode,
      url: req.originalUrl,
      method: req.method,
      isOperational: err.isOperational,
    });
  }

  // Ensure response hasn't been sent already
  if (!res.headersSent) {
    sendResponse(res, statusCode, message);
  }
};
