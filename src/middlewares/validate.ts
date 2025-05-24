import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import logger from '../config/logger';

type ValidationSource = 'body' | 'query' | 'params' | 'headers';

// Helper function to convert string "true"/"false" to actual booleans
const processFormData = (data: any): any => {
  const result: any = {};
  for (const key in data) {
    if (data[key] === 'true') {
      result[key] = true;
    } else if (data[key] === 'false') {
      result[key] = false;
    } else {
      result[key] = data[key];
    }
  }
  return result;
};

const validate =
  (schema: ZodSchema<any>, source: ValidationSource = 'body') =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // Log the request body for debugging
      logger.debug(`Validating ${source}:`, JSON.stringify(req[source]));

      // Process the request body if it's multipart/form-data
      const contentType = req.headers['content-type'] || '';
      if (source === 'body' && contentType.includes('multipart/form-data')) {
        const processedBody = processFormData(req[source]);
        logger.debug('Processed form data:', JSON.stringify(processedBody));
        schema.parse(processedBody);
      } else {
        schema.parse(req[source]);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
        }));
        logger.error('Validation error:', JSON.stringify(errors));
        next(new ApiError(httpStatus.BAD_REQUEST, 'Validation error', false, errors));
      } else {
        logger.error('Non-Zod validation error:', error);
        next(error);
      }
    }
  };

export default validate;
