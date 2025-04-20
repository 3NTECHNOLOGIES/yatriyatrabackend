import mongoose from "mongoose";
import config from "./config";
import logger from "./logger";

/**
 * Connect to MongoDB
 */
const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.mongoose.url);

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error("Failed to connect to MongoDB", error);
    process.exit(1);
  }
};

export default connectDB;
