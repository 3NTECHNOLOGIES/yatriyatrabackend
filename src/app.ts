import express, { Express } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import passport from 'passport';
import httpStatus from 'http-status';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import config from './config/config';
import { errorConverter, errorHandler } from './middlewares/error';
import routes from './routes/v1';
import jwtStrategy from './config/passport';
import ApiError from './utils/ApiError';
import logger from './config/logger';
import docsRoute from './routes/docs.route';

// Create Express app
const app = express();

// Enable trust proxy - only trust first proxy
app.set('trust proxy', 1);

// Set up CORS
app.use(
  cors({
    origin: '*',
  }),
);

// Configure Helmet with cross-origin resource policy
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: [
          "'self'",
          'data:',
          'blob:',
          'https://yatriyatra.com',
          'http://localhost:5173',
          'http://localhost:8080',
        ],
        connectSrc: [
          "'self'",
          'https://yatriyatra.com',
          'http://localhost:5173',
          'http://localhost:8080',
        ],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  }),
);

// Parse JSON request body
app.use(
  express.json({
    limit: '50mb',
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  }),
);

// Parse URL-encoded request body
app.use(
  express.urlencoded({
    extended: true,
    limit: '50mb',
    parameterLimit: 100000,
  }),
);

// Enable cookie parser
app.use(cookieParser());

// Enable gzip compression with higher levels for text
app.use(
  compression({
    level: 6,
    threshold: 10 * 1000, // 10KB
    filter: (req, res) => {
      if (req.headers['content-type']?.includes('multipart/form-data')) {
        return false;
      }
      return compression.filter(req, res);
    },
  }),
);

// Add request logging in development mode
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// Sanitize request data - MOVED BEFORE ROUTES
app.use(mongoSanitize());

// Rate limiting for API routes - MOVED BEFORE ROUTES
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: request => {
    if (!request.ip) {
      console.error('Warning: request.ip is missing!');
      return request.socket.remoteAddress || '127.0.0.1';
    }
    // Strip any port numbers from the IP
    return request.ip.replace(/:\d+[^:]*$/, '');
  },
  validate: {
    trustProxy: false, // Disable trust proxy validation since we handle it ourselves
  },
});
app.use('/api', limiter);

// JWT authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// Debug middleware for logging requests
app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.originalUrl}`);
  logger.debug('Content-Type:', req.headers['content-type']);
  if (req.originalUrl.includes('/blogs') && req.method === 'POST') {
    logger.debug('Blog Request Body:', JSON.stringify(req.body, null, 2));
    if ('file' in req && req.file) {
      logger.debug('File:', req.file.originalname);
    }
  }
  next();
});

// Swagger documentation route
app.use('/api-docs', docsRoute);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(httpStatus.OK).send({ status: 'ok' });
});

// API v1 routes
app.use('/api/v1', routes);

// Send 404 error for unknown API requests
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// Convert error to ApiError, if needed
app.use(errorConverter);

// Handle errors
app.use(errorHandler);

export default app;
