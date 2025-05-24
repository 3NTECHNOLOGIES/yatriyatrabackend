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
import { uploadToS3 } from '../services/upload.service';
import logger from '../config/logger';

// Extend the Request type to include authenticated user information
interface AuthenticatedUser {
  id?: string;
  role: string;
}

type AuthRequest = Request & {
  user?: AuthenticatedUser;
};

// Extend Request to include file from multer
interface AuthRequestWithFile extends AuthRequest {
  file?: Express.Multer.File;
}

export const createBlogHandler = async (req: AuthRequestWithFile, res: Response) => {
  try {
    // Set author as the authenticated user
    if (!req.user?.id) {
      sendResponse(res, httpStatus.UNAUTHORIZED, 'User must be authenticated');
      return;
    }

    // Log request body and file for debugging
    logger.info('Blog creation request body:', JSON.stringify(req.body));
    logger.info('Blog creation request file:', req.file ? 'File present' : 'No file');

    const blogData = {
      ...req.body,
      author: new mongoose.Types.ObjectId(req.user.id),
    };

    // Handle cover image upload if provided
    if (req.file) {
      try {
        const fileToUpload = {
          fieldname: req.file.fieldname,
          originalname: req.file.originalname,
          encoding: req.file.encoding,
          mimetype: req.file.mimetype,
          size: req.file.size,
          buffer: req.file.buffer,
        };

        // Upload to S3 with 'blog-covers' folder
        const uploadResult = await uploadToS3(fileToUpload, { folderName: 'blog-covers' });
        blogData.coverImage = uploadResult.fileUrl;
      } catch (uploadError) {
        logger.error('Cover image upload error:', uploadError);
        sendResponse(res, httpStatus.BAD_REQUEST, 'Failed to upload cover image');
        return;
      }
    }

    const blog = await createBlog(blogData);
    sendResponse(res, httpStatus.CREATED, 'Blog created successfully', { blog });
  } catch (error) {
    if (error instanceof Error) {
      logger.error('Blog creation error:', error.message);
      sendResponse(res, httpStatus.BAD_REQUEST, error.message);
    } else {
      logger.error('Unknown blog creation error:', error);
      sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong');
    }
  }
};

export const saveBlogAsDraftHandler = async (req: AuthRequestWithFile, res: Response) => {
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

    // Handle cover image upload if provided
    if (req.file) {
      try {
        const fileToUpload = {
          fieldname: req.file.fieldname,
          originalname: req.file.originalname,
          encoding: req.file.encoding,
          mimetype: req.file.mimetype,
          size: req.file.size,
          buffer: req.file.buffer,
        };

        // Upload to S3 with 'blog-covers' folder
        const uploadResult = await uploadToS3(fileToUpload, { folderName: 'blog-covers' });
        blogData.coverImage = uploadResult.fileUrl;
      } catch (uploadError) {
        sendResponse(res, httpStatus.BAD_REQUEST, 'Failed to upload cover image');
        return;
      }
    }

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
      orderBy,
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
      orderBy: orderBy as string,
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

export const updateBlogHandler = async (req: AuthRequestWithFile, res: Response) => {
  try {
    // Admin can update any blog, but ensure we don't change the author
    const updateData = { ...req.body };

    // Handle cover image upload if provided
    if (req.file) {
      try {
        const fileToUpload = {
          fieldname: req.file.fieldname,
          originalname: req.file.originalname,
          encoding: req.file.encoding,
          mimetype: req.file.mimetype,
          size: req.file.size,
          buffer: req.file.buffer,
        };

        // Upload to S3 with 'blog-covers' folder
        const uploadResult = await uploadToS3(fileToUpload, { folderName: 'blog-covers' });
        updateData.coverImage = uploadResult.fileUrl;
      } catch (uploadError) {
        sendResponse(res, httpStatus.BAD_REQUEST, 'Failed to upload cover image');
        return;
      }
    }

    const blog = await updateBlogById(req.params.blogId, updateData);
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
