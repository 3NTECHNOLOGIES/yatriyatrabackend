import { Request, Response } from 'express';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlogById,
  deleteBlogById,
  publishBlog,
  saveBlogAsDraft,
  incrementBlogViews,
} from '../services/blog.service';
import { sendResponse } from '../utils/response';

// Extend the Request type to include authenticated user information
interface AuthenticatedUser {
  id: string;
  role: string;
}

interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export const createBlogHandler = async (req: AuthRequest, res: Response) => {
  try {
    // Set author as the authenticated user
    if (!req.user?.id) {
      sendResponse(res, httpStatus.UNAUTHORIZED, 'User must be authenticated');
      return;
    }

    const blogData = {
      ...req.body,
      author: new mongoose.Types.ObjectId(req.user.id),
    };

    const blog = await createBlog(blogData);
    sendResponse(res, httpStatus.CREATED, 'Blog created successfully', { blog });
  } catch (error) {
    if (error instanceof Error) {
      sendResponse(res, httpStatus.BAD_REQUEST, error.message);
    } else {
      sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong');
    }
  }
};

export const saveBlogAsDraftHandler = async (req: AuthRequest, res: Response) => {
  try {
    // Set author as the authenticated user
    if (!req.user?.id) {
      sendResponse(res, httpStatus.UNAUTHORIZED, 'User must be authenticated');
      return;
    }

    const blogData = {
      ...req.body,
      author: new mongoose.Types.ObjectId(req.user.id),
    };

    const blog = await saveBlogAsDraft(blogData);
    sendResponse(res, httpStatus.CREATED, 'Blog saved as draft successfully', { blog });
  } catch (error) {
    if (error instanceof Error) {
      sendResponse(res, httpStatus.BAD_REQUEST, error.message);
    } else {
      sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong');
    }
  }
};

export const publishBlogHandler = async (req: Request, res: Response) => {
  try {
    const blog = await publishBlog(req.params.blogId);
    sendResponse(res, httpStatus.OK, 'Blog published successfully', { blog });
  } catch (error) {
    if (error instanceof Error) {
      sendResponse(
        res,
        error.message === 'Blog not found' ? httpStatus.NOT_FOUND : httpStatus.BAD_REQUEST,
        error.message,
      );
    } else {
      sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong');
    }
  }
};

export const getBlogsHandler = async (req: Request, res: Response) => {
  try {
    // Get pagination, search and filter parameters from query
    const {
      page,
      limit,
      sortBy,
      search,
      categoryId,
      createdAtFrom,
      createdAtTo,
      featured,
      status,
    } = req.query;

    const options = {
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      sortBy: sortBy as string,
      search: search as string,
      categoryId: categoryId as string,
      createdAtFrom: createdAtFrom ? new Date(createdAtFrom as string) : undefined,
      createdAtTo: createdAtTo ? new Date(createdAtTo as string) : undefined,
      featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
      status: status as string,
    };

    const result = await getBlogs(options);
    sendResponse(res, httpStatus.OK, 'Blogs retrieved successfully', result);
  } catch (error) {
    if (error instanceof Error) {
      sendResponse(res, httpStatus.BAD_REQUEST, error.message);
    } else {
      sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong');
    }
  }
};

export const getBlogHandler = async (req: Request, res: Response) => {
  try {
    // Get blog and increment views in one operation
    const blog = await incrementBlogViews(req.params.blogId);
    sendResponse(res, httpStatus.OK, 'Blog retrieved successfully', { blog });
  } catch (error) {
    if (error instanceof Error) {
      sendResponse(
        res,
        error.message === 'Blog not found' ? httpStatus.NOT_FOUND : httpStatus.BAD_REQUEST,
        error.message,
      );
    } else {
      sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong');
    }
  }
};

export const updateBlogHandler = async (req: AuthRequest, res: Response) => {
  try {
    // Admin can update any blog, but ensure we don't change the author
    const blog = await updateBlogById(req.params.blogId, req.body);
    sendResponse(res, httpStatus.OK, 'Blog updated successfully', { blog });
  } catch (error) {
    if (error instanceof Error) {
      sendResponse(
        res,
        error.message === 'Blog not found' ? httpStatus.NOT_FOUND : httpStatus.BAD_REQUEST,
        error.message,
      );
    } else {
      sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong');
    }
  }
};

export const deleteBlogHandler = async (req: Request, res: Response) => {
  try {
    await deleteBlogById(req.params.blogId);
    sendResponse(res, httpStatus.OK, 'Blog deleted successfully');
  } catch (error) {
    if (error instanceof Error) {
      sendResponse(
        res,
        error.message === 'Blog not found' ? httpStatus.NOT_FOUND : httpStatus.BAD_REQUEST,
        error.message,
      );
    } else {
      sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong');
    }
  }
};
