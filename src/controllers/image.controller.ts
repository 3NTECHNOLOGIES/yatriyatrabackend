import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { s3, s3Config } from '../config/s3';
import catchAsync from '../utils/catchAsync';

/**
 * Get an image from S3 and stream it to the client
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const getImage = catchAsync(async (req: Request, res: Response) => {
  // Get the key from query parameter
  const key = req.query.key as string;

  // If there's no key, return a 400 error
  if (!key) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'No image key provided',
    });
  }

  try {
    // Get the image from S3
    const params = {
      Bucket: s3Config.bucket || 'yatriyatra-uploads',
      Key: key,
    };

    // Get the object and check if it exists
    const headObject = await s3.headObject(params).promise();

    // Set content type and cache headers
    res.set({
      'Content-Type': headObject.ContentType,
      'Cache-Control': 'public, max-age=31536000',
    });

    // Stream the image directly to the response
    const stream = s3.getObject(params).createReadStream();
    stream.pipe(res);
  } catch (error: any) {
    // If the object doesn't exist, return a 404
    if (error.code === 'NoSuchKey' || error.code === 'NotFound') {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: 'Image not found',
      });
    }

    // For other errors, return a 500
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve image',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});
