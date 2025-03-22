import { ConfigModuleOptions } from '@nestjs/config';
import * as Joi from 'joi';
import { join } from 'path';
// Load the appropriate .env file based on NODE_ENV
const envFilePath = (): string[] => {
  const env = process.env.NODE_ENV || 'development';
  // Try both the root .env file and the environment-specific file
  return ['.env', join(__dirname, 'envs', `.env.${env}`)];
};

// Configuration validation schema
export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'staging', 'production')
    .default('development'),
  PORT: Joi.number().default(3000),

  // Database
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().required(),
  DATABASE_USERNAME: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),

  // JWT
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('1d'),

  // App
  API_PREFIX: Joi.string().default('api'),
  APP_NAME: Joi.string().default('NestJS Enterprise App'),
  APP_DESCRIPTION: Joi.string(),
  APP_VERSION: Joi.string(),
});

// Config module options
export const configModuleOptions: ConfigModuleOptions = {
  envFilePath: envFilePath(),
  isGlobal: true,
  validationSchema,
  validationOptions: {
    allowUnknown: true,
    abortEarly: false,
  },
  expandVariables: true,
  cache: true,
  ignoreEnvFile: false,
};

// Configuration factory
export default () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),

  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306', 10),
    username: process.env.DATABASE_USERNAME || 'root',
    password: process.env.DATABASE_PASSWORD || 'root',
    database: process.env.DATABASE_NAME || 'nest_enterprise_dev',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev_jwt_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },

  app: {
    name: process.env.APP_NAME || 'NestJS Enterprise App',
    description:
      process.env.APP_DESCRIPTION || 'Enterprise-grade NestJS application',
    version: process.env.APP_VERSION || '1.0.0',
    apiPrefix: process.env.API_PREFIX || 'api',
  },
});
