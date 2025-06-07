import multer from 'multer';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';

// Configure storage for multer
const storage = multer.memoryStorage();

// File filter to allow only images
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      cb(new ApiError(httpStatus.BAD_REQUEST, 'File size too large. Maximum size is 10MB'));
      return;
    }
    cb(null, true);
  } else {
    cb(new ApiError(httpStatus.BAD_REQUEST, 'Only image files are allowed'));
  }
};

// Configure multer middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    files: 1, // Maximum number of files
  },
});

export default upload;
