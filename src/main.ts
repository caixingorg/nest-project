import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger/swagger.config';
import { AppLogger } from './app/common/utils/logger.util';

async function bootstrap() {
  // Create the application
  // Create the application instance
  const app = await NestFactory.create(AppModule, {
    logger: new AppLogger(),
  });

  // Get configuration service before applying security settings
  const configService = app.get(ConfigService);

  // Apply security headers using Helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
        },
      },
    }),
  );

  // Configure CORS
  app.enableCors({
    origin: JSON.parse(configService.get<string>('cors.origins') || '[]'),
    methods:
      configService.get<string>('cors.methods') ||
      'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders:
      configService.get<string>('cors.allowedHeaders') ||
      'Content-Type, Authorization',
    credentials: true,
  });

  // Apply rate limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: parseInt(configService.get<string>('rateLimit.max') || '100', 10),
    }),
  );

  // Set application port and prefix
  const port = 3003;
  const apiPrefix = configService.get<string>('app.apiPrefix') || 'api';
  app.setGlobalPrefix(apiPrefix);

  // Setup Swagger documentation
  setupSwagger(app);

  // Start the application server
  await app.listen(port);
  // Application startup logging
  const logger = new AppLogger('Bootstrap');
  logger.log(
    `Application is running on: http://localhost:${port}/${apiPrefix}`,
  );
  logger.log(
    `Swagger documentation: http://localhost:${port}/${apiPrefix}/docs`,
  );
}

bootstrap();
