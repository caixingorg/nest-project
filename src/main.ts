import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger/swagger.config';
import { AppLogger } from './app/common/utils/logger.util';

async function bootstrap() {
  // Create the application
  const app = await NestFactory.create(AppModule, {
    logger: new AppLogger(),
  });

  // Get configuration service
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 3002; // Use a different port
  const apiPrefix = configService.get<string>('app.apiPrefix') || 'api';

  // Set global prefix
  app.setGlobalPrefix(apiPrefix);

  // Enable CORS
  app.enableCors();

  // Global validation pipe is already registered in AppModule via APP_PIPE

  // Set up Swagger documentation
  setupSwagger(app);

  // Start the server
  await app.listen(port);
  const logger = new AppLogger('Bootstrap');
  logger.log(
    `Application is running on: http://localhost:${port}/${apiPrefix}`,
  );
  logger.log(
    `Swagger documentation: http://localhost:${port}/${apiPrefix}/docs`,
  );
}

bootstrap();
