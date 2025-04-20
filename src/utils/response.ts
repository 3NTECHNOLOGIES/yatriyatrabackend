import { Response } from 'express';
import httpStatus from 'http-status';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
}

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data: T | null = null,
): void => {
  const response: ApiResponse<T> = {
    success: statusCode >= 200 && statusCode < 300,
    message,
    data,
  };

  res.status(statusCode).json(response);
};
