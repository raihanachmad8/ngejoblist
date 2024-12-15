// src/core/logger/logger.service.ts
import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { createLogger, format, transports, Logger } from 'winston';
import 'winston-daily-rotate-file';
import { ConfigService } from '@nestjs/config';
import { LoggingConfig } from '../../common/types/env.type';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: Logger;

  constructor(private readonly configService: ConfigService) {
    const loggingConfig = this.configService.get<LoggingConfig>('logging');

    this.logger = createLogger({
      level: loggingConfig.level || 'info',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.splat(),
        loggingConfig.format === 'json' ? format.json() : format.simple(),
      ),
      transports: [
        // Console transport
        new transports.Console({
          format:
            loggingConfig.destination === 'console'
              ? format.combine(format.colorize(), format.simple())
              : format.json(),
        }),
        // File transport
        ...(loggingConfig.destination === 'file' ||
        loggingConfig.destination === 'both'
          ? [
              new transports.DailyRotateFile({
                filename: 'logs/error-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                level: 'error',
                maxSize: loggingConfig.maxSize || '20m',
                maxFiles: loggingConfig.maxFiles || 14,
              }),
              new transports.DailyRotateFile({
                filename: 'logs/combined-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                maxSize: loggingConfig.maxSize || '20m',
                maxFiles: loggingConfig.maxFiles || 14,
              }),
            ]
          : []),
      ],
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }

  logWithMeta(
    level: 'info' | 'error' | 'warn' | 'debug' | 'verbose',
    message: string,
    meta?: Record<string, any>,
  ) {
    this.logger.log(level, message, meta);
  }
}
