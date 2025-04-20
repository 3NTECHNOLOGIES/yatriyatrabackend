import express from 'express';
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

// Set security HTTP headers
app.use(helmet());

// Enable CORS
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
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

// JWT authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// Swagger documentation route
app.use('/api-docs', docsRoute);

// API v1 routes (before sanitization and rate limiting)
app.use('/api/v1', routes);

// Rate limiting for API routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Sanitize request data
app.use('/api', mongoSanitize());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(httpStatus.OK).send({ status: 'ok' });
});

// Send 404 error for unknown API requests
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// Convert error to ApiError, if needed
app.use(errorConverter);

// Handle errors
app.use(errorHandler);

export default app;
