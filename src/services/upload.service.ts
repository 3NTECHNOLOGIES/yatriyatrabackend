import { getS3Instance, s3Config } from '../config/s3';
import { IUploadedFile, IUploadOptions } from '../interfaces/upload.interface';
import config from '../config/config';

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
  // Use the provided folderName or default to 'uploads'
  const folderName = options?.folderName || 'uploads';

  // Generate a unique file name to avoid collisions
  const timestamp = Date.now();
  const fileExtension = file.originalname.split('.').pop();
  const key = `${folderName}/${timestamp}-${file.originalname.replace(/\s+/g, '-')}`;

  // Ensure bucket name is defined
  const bucketName = s3Config.bucket || 'yatriyatra-uploads';

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
  // In production, set API_BASE_URL to your production domain, e.g. https://api.yatriyatra.com/v1
  const proxyUrl = `${config.baseUrl}/images?key=${encodeURIComponent(key)}`;

  return {
    fileUrl: proxyUrl,
    key: key,
  };
};
