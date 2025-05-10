import { Response } from 'express';
import httpStatus from 'http-status';
import { uploadToS3 } from '../services/upload.service';
import catchAsync from '../utils/catchAsync';
import {
  IUploadedFile,
  IFileUploadResponse,
  IUploadRequest,
  IUploadOptions,
} from '../interfaces/upload.interface';

/**
 * Upload an image to S3
 * @param {IUploadRequest} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} - Response with upload result
 */
export const uploadImage = catchAsync(async (req: IUploadRequest, res: Response) => {
  // Check if a file was uploaded
  if (!req.file) {
    const response: IFileUploadResponse = {
      success: false,
      message: 'No file uploaded',
      error: 'Please provide an image file',
    };
    return res.status(httpStatus.BAD_REQUEST).json(response);
  }

  try {
    // Convert Express.Multer.File to IUploadedFile
    const fileToUpload: IUploadedFile = {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      encoding: req.file.encoding,
      mimetype: req.file.mimetype,
      size: req.file.size,
      buffer: req.file.buffer,
    };

    // Get the folderName from the request body (if provided)
    const options: IUploadOptions = {};
    if (req.body.folderName) {
      options.folderName = req.body.folderName;
    }

    // Upload the file to S3 with the specified options
    const uploadResult = await uploadToS3(fileToUpload, options);

    // Return the upload result
    const response: IFileUploadResponse = {
      success: true,
      message: 'File uploaded successfully',
      data: {
        fileUrl: uploadResult.fileUrl,
        key: uploadResult.key,
      },
    };

    return res.status(httpStatus.CREATED).json(response);
  } catch (error) {
    const response: IFileUploadResponse = {
      success: false,
      message: 'File upload failed',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(response);
  }
});
