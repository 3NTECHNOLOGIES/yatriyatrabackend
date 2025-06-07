import { getS3Instance, s3Config } from '../config/s3';
import { IUploadedFile, IUploadOptions } from '../interfaces/upload.interface';
import config from '../config/config';
import logger from '../config/logger';

/**
 * Upload a file to AWS S3 and return an API proxy URL
 * @param {IUploadedFile} file - The file to upload
 * @param {IUploadOptions} options - Upload options like folderName
 * @returns {Promise<{ fileUrl: string, key: string }>} - Upload result with API proxy URL and key
 */
export const uploadToS3 = async (
  file: IUploadedFile,
  options?: IUploadOptions,
): Promise<{ fileUrl: string; key: string }> => {
  try {
    // Validate file input
    if (!file.buffer || !file.mimetype || !file.originalname) {
      logger.error('Invalid file input:', {
        hasBuffer: !!file.buffer,
        mimetype: file.mimetype,
        originalname: file.originalname,
      });
      throw new Error('Invalid file input: Missing required file properties');
    }

    // Use the provided folderName or default to 'uploads'
    const folderName = options?.folderName || 'uploads';

    // Generate a unique file name to avoid collisions
    const timestamp = Date.now();
    const fileExtension = file.originalname.split('.').pop();
    const key = `${folderName}/${timestamp}-${file.originalname.replace(/\s+/g, '-')}`;

    // Ensure bucket name is defined
    const bucketName = s3Config.bucket;
    if (!bucketName) {
      logger.error('S3 bucket name is not defined');
      throw new Error('S3 bucket name is not defined in configuration');
    }

    // Log S3 configuration (without sensitive data)
    logger.info('S3 upload configuration:', {
      bucket: bucketName,
      region: s3Config.region,
      hasAccessKey: !!s3Config.accessKeyId,
      hasSecretKey: !!s3Config.secretAccessKey,
      key,
      contentType: file.mimetype,
      fileSize: file.size,
    });

    // Set the parameters for S3 upload
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    // Get S3 instance and upload the file
    const s3 = getS3Instance();
    await s3.upload(params).promise();

    // Use baseUrl from config that can be set via environment variables
    const baseUrl = config.baseUrl;
    if (!baseUrl) {
      logger.warn('API_BASE_URL is not defined, using default URL construction');
    }

    const proxyUrl = `${baseUrl}/images?key=${encodeURIComponent(key)}`;
    logger.info('File uploaded successfully:', { key, proxyUrl });

    return {
      fileUrl: proxyUrl,
      key: key,
    };
  } catch (error) {
    logger.error('S3 upload error:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
};
