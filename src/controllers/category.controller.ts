import { Request, Response } from 'express';
import httpStatus from 'http-status';
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategoryById,
  deleteCategoryById,
} from '../services/category.service';
import { sendResponse } from '../utils/response';

export const createCategoryHandler = async (req: Request, res: Response) => {
  try {
    const category = await createCategory(req.body);
    sendResponse(res, httpStatus.CREATED, 'Category created successfully', { category });
  } catch (error) {
    if (error instanceof Error) {
      sendResponse(res, httpStatus.BAD_REQUEST, error.message);
    } else {
      sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong');
    }
  }
};

export const getCategoriesHandler = async (req: Request, res: Response) => {
  try {
    const { page, limit, sortBy, search } = req.query;
    const options = {
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      sortBy: sortBy as string,
      search: search as string,
    };

    const result = await getCategories(options);
    sendResponse(res, httpStatus.OK, 'Categories retrieved successfully', result);
  } catch (error) {
    sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong');
  }
};

export const getCategoryHandler = async (req: Request, res: Response) => {
  try {
    const category = await getCategoryById(req.params.categoryId);
    sendResponse(res, httpStatus.OK, 'Category retrieved successfully', { category });
  } catch (error) {
    if (error instanceof Error) {
      sendResponse(
        res,
        error.message === 'Category not found' ? httpStatus.NOT_FOUND : httpStatus.BAD_REQUEST,
        error.message,
      );
    } else {
      sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong');
    }
  }
};

export const updateCategoryHandler = async (req: Request, res: Response) => {
  try {
    const category = await updateCategoryById(req.params.categoryId, req.body);
    sendResponse(res, httpStatus.OK, 'Category updated successfully', { category });
  } catch (error) {
    if (error instanceof Error) {
      sendResponse(
        res,
        error.message === 'Category not found' ? httpStatus.NOT_FOUND : httpStatus.BAD_REQUEST,
        error.message,
      );
    } else {
      sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong');
    }
  }
};

export const deleteCategoryHandler = async (req: Request, res: Response) => {
  try {
    await deleteCategoryById(req.params.categoryId);
    sendResponse(res, httpStatus.OK, 'Category deleted successfully');
  } catch (error) {
    if (error instanceof Error) {
      sendResponse(
        res,
        error.message === 'Category not found' ? httpStatus.NOT_FOUND : httpStatus.BAD_REQUEST,
        error.message,
      );
    } else {
      sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong');
    }
  }
};
