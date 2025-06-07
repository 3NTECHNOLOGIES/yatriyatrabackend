import dotenv from 'dotenv';
import path from 'path';
import Joi from 'joi';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    HOST: Joi.string().default('localhost'),
    MONGODB_URI: Joi.string().required().description('MongoDB connection string'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number()
      .default(30)
      .description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number()
      .default(30)
      .description('days after which refresh tokens expire'),
    CORS_ORIGIN: Joi.string().description('CORS allowed origins'),
    API_BASE_URL: Joi.string().description('Base URL for API endpoints'),
    S3_ACCESS_KEY: Joi.string().description('AWS S3 Access Key'),
    S3_SECRET_ACCESS_KEY: Joi.string().description('AWS S3 Secret Access Key'),
    S3_REGION: Joi.string().default('us-east-1').description('AWS S3 Region'),
    S3_BUCKET: Joi.string().description('AWS S3 Bucket Name'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: 'key' } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

let base_url =
  process.env.NODE_ENV === 'development'
    ? `http://${envVars.HOST}:${envVars.PORT}/api/v1`
    : 'https://api.yatriyatra.com/api/v1';

export default {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  host: envVars.HOST,
  // baseUrl: envVars.API_BASE_URL || `http://${envVars.HOST}:${envVars.PORT}/api/v1`,
  baseUrl: base_url,
  mongoose: {
    url: envVars.MONGODB_URI + (envVars.NODE_ENV === 'test' ? '-test' : ''),
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
  },
  cors: {
    origin: envVars.CORS_ORIGIN
      ? envVars.CORS_ORIGIN.split(',')
      : ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:3000'],
  },
};
