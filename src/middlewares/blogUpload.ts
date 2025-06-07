import multer from 'multer';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';

// Configure storage for blog uploads
const storage = multer.memoryStorage();

// Configure multer middleware specifically for blogs
const blogUpload = multer({
  storage,
  limits: {
    fieldSize: 25 * 1024 * 1024, // 25MB for text fields
    fileSize: 10 * 1024 * 1024, // 10MB for images
    fields: 10, // Maximum number of non-file fields
    files: 1, // Maximum number of file fields
    parts: 20, // Maximum number of parts (fields + files)
  },
});

export default blogUpload;
