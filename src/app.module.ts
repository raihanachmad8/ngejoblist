import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { CoreModule } from './core/core.module';
import {
  ThrottlerGuard,
  ThrottlerModule,
} from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get<number>('security.rateLimit.ttl'),
            limit: configService.get<number>('security.rateLimit.limit'),
            blockDuration: configService.get<number>(
              'security.rateLimit.duration',
            ),
          },
        ],
        errorMessage: "You've reached the maximum number of requests.",
      }),
    }),
    CommonModule,
    CoreModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, 
    },
  ],
})
export class AppModule {}
