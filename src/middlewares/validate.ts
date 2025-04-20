import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';

const validate = (schema: ZodSchema<any>) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      next(new ApiError(httpStatus.BAD_REQUEST, 'Validation error', false, errors));
    } else {
      next(error);
    }
  }
};

export default validate;
