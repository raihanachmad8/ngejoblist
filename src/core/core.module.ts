// src/core/core.module.ts
import { Module, Global, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from './logger/logger.module';
import { PrismaModule } from './database/prisma.module';

// Import konfigurasi
import appConfig from '../common/config/app.config';
import databaseConfig from '../common/config/database.config';
import authConfig from '../common/config/auth.config';
import securityConfig from '../common/config/security.config';
import emailConfig from '../common/config/email.config';
import storageConfig from '../common/config/storage.config';
import loggingConfig from '../common/config/logging.config';
import { RequestLoggerMiddleware } from './middleware/request-logger.middleware';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig,
        authConfig,
        securityConfig,
        emailConfig,
        storageConfig,
        loggingConfig,
      ],
      cache: true,
      expandVariables: true,
    }),
    LoggerModule,
    PrismaModule,
    CloudinaryModule,
  ],
  exports: [ConfigModule, LoggerModule, PrismaModule, CloudinaryModule],
})
export class CoreModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
