import express from 'express';
import { uploadImage } from '../../controllers/upload.controller';
import upload from '../../middlewares/upload';
import auth from '../../middlewares/auth';

const router = express.Router();

/**
 * @swagger
 * /upload-image:
 *   post:
 *     summary: Upload an image to AWS S3
 *     description: Uploads an image file to AWS S3 storage
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload (max 5MB, images only)
 *               folderName:
 *                 type: string
 *                 description: Folder name in S3 where the image will be uploaded (default is 'uploads')
 *                 example: blog-images
 *     responses:
 *       201:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: File uploaded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     fileUrl:
 *                       type: string
 *                       example: https://s3.amazonaws.com/bucket-name/uploads/1234567890-image.jpg
 *                     key:
 *                       type: string
 *                       example: uploads/1234567890-image.jpg
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: No file uploaded
 *                 error:
 *                   type: string
 *                   example: Please provide an image file
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: Please authenticate
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: File upload failed
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
router.post(
  '/image',
  auth(),
  (req, res, next) => {
    upload.single('image')(req, res, err => {
      if (err instanceof Error) {
        if (err.name === 'MulterError' && err.message === 'File too large') {
          return res.status(413).json({
            success: false,
            message: 'File too large',
            error: 'Maximum file size is 10MB',
          });
        }
        return res.status(400).json({
          success: false,
          message: 'Upload failed',
          error: err.message,
        });
      }
      next();
    });
  },
  uploadImage,
);

export default router;
