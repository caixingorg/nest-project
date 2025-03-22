import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './app/modules/user/user.module';
import { AuthModule } from './app/modules/auth/auth.module';
import { configModuleOptions } from './config/configuration';
import { HttpExceptionFilter } from './app/common/filters/http-exception.filter';
import { ValidationPipe } from './app/common/pipes/validation.pipe';
import { i18nConfig } from './i18n/i18n.config';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot(configModuleOptions),
    // Prisma
    PrismaModule,
    // Internationalization
    i18nConfig,
    // Application Modules
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
