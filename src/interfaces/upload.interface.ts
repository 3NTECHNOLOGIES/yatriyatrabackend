import { Request } from 'express';

export interface IUploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  filename?: string;
  path?: string;
}

export interface IUploadOptions {
  folderName?: string;
}

export interface IFileUploadResponse {
  success: boolean;
  message: string;
  data?: {
    fileUrl: string;
    key: string;
  };
  error?: string;
}

// Use Express.Multer namespace already available through @types/multer
export interface IUploadRequest extends Request {
  file?: Express.Multer.File;
  body: {
    folderName?: string;
  };
}
