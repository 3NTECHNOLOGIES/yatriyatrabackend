import app from './app';
import config from './config/config';
import logger from './config/logger';
import connectDB from './config/db';

let server: any;

// Handle uncaught exceptions
process.on('uncaughtException', err => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start Express server
    server = app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} - Environment: ${config.env}`);
    });
  } catch (error) {
    logger.error('Failed to start the server:', error);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
  if (server) {
    server.close(() => {
      logger.info('💥 Process terminated!');
    });
  }
});
