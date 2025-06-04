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

// Set up CORS
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (
        config.env === 'development' ||
        (Array.isArray(config.cors.origin) && config.cors.origin.indexOf(origin) !== -1)
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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
        imgSrc: ["'self'", 'data:', 'blob:', 'http://localhost:5173', 'http://localhost:8080'],
        connectSrc: ["'self'", 'http://localhost:5173', 'http://localhost:8080'],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  }),
);

// Parse JSON request body
app.use(express.json());

// Parse URL-encoded request body
app.use(express.urlencoded({ extended: true }));

// Enable cookie parser
app.use(cookieParser());

// Enable gzip compression
app.use(compression());

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
