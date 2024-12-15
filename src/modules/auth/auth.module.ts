import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from '../../core/database/prisma.service';
import { CryptoUtil } from '../../common/utils';
import { AtStrategy, RtStrategy } from './strategies';
import { PrismaModule } from '../../core/database/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }), // Integrasi PassportModule
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('auth.jwt.accessSecret'),
        signOptions: {
          expiresIn: configService.get<string>('auth.jwt.accessExpiration'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, PrismaService, CryptoUtil, AtStrategy, RtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
