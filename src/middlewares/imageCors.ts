import { Request, Response, NextFunction } from 'express';

// List of allowed origins for development
const allowedOrigins = ['http://localhost:5173', 'http://localhost:8080'];

export const imageCors = (req: Request, res: Response, next: NextFunction): void => {
  const origin = req.headers.origin;

  // Check if the origin is in our allowed list
  if (origin && allowedOrigins.includes(origin)) {
    // Set CORS headers for image routes
    res.set({
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Range',
      'Access-Control-Expose-Headers':
        'Content-Type, Content-Length, Content-Disposition, Content-Range',
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'Cross-Origin-Embedder-Policy': 'credentialless',
    });
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  next();
};
