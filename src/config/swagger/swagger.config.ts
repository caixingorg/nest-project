import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const configService = app.get(ConfigService);
  const appName =
    configService.get<string>('app.name') || 'NestJS Enterprise App';
  const appDescription =
    configService.get<string>('app.description') ||
    'Enterprise-grade NestJS application';
  const appVersion = configService.get<string>('app.version') || '1.0.0';
  const apiPrefix = configService.get<string>('app.apiPrefix') || 'api';

  const options = new DocumentBuilder()
    .setTitle(appName)
    .setDescription(appDescription)
    .setVersion(appVersion)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}
