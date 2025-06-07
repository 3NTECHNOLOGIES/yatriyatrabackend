import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

// S3 configuration interface
interface IS3Config {
  accessKeyId: string | undefined;
  secretAccessKey: string | undefined;
  region: string;
  bucket: string | undefined;
}

// Initialize S3 with credentials from environment variables
export const s3Config: IS3Config = {
  accessKeyId: process.env.S3_ACCESS_KEY || '',
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  region: process.env.S3_REGION || 'ap-southeast-1',
  bucket: process.env.S3_BUCKET || 'yatriyatra',
};

// Check if S3 credentials are provided
export const hasS3Credentials: boolean = !!(
  s3Config.accessKeyId &&
  s3Config.secretAccessKey &&
  s3Config.bucket
);

// Create S3 instance only if credentials are provided
export let s3: AWS.S3 | null = null;

if (hasS3Credentials) {
  s3 = new AWS.S3({
    accessKeyId: s3Config.accessKeyId,
    secretAccessKey: s3Config.secretAccessKey,
    region: s3Config.region,
  });
}

// Function to get S3 instance with validation
export const getS3Instance = (): AWS.S3 => {
  if (!s3) {
    throw new Error(
      'AWS S3 credentials are required. Please check your .env file and ensure S3_ACCESS_KEY, S3_SECRET_ACCESS_KEY, and S3_BUCKET are set.',
    );
  }
  return s3;
};
