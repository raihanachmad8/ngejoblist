import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GlobalExceptionFilter } from './global-exception.filter';
import { LoggerService } from '../../core/logger/logger.service';
import { HttpAdapterHost } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import loggingConfig from '../../common/config/logging.config';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let httpAdapterHost: HttpAdapterHost;
  let loggerService: LoggerService;

  beforeEach(async () => {
    const mockLoggerService = {
      logWithMeta: jest.fn(),
      logger: jest.fn(),
      configService: jest.fn(),
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    };

    // Mock httpAdapter with the 'reply' method
    const mockHttpAdapter = {
      reply: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [loggingConfig],
        }),
      ],
      providers: [
        GlobalExceptionFilter,
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
        {
          provide: HttpAdapterHost,
          useValue: {
            httpAdapter: mockHttpAdapter, // Inject the mock httpAdapter here
          },
        },
      ],
    }).compile();

    filter = module.get<GlobalExceptionFilter>(GlobalExceptionFilter);
    httpAdapterHost = module.get<HttpAdapterHost>(HttpAdapterHost);
    loggerService = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should catch HttpException and return response', () => {
    const mockArgumentsHost: ArgumentsHost = {
      switchToHttp: jest.fn().mockReturnThis(),
      getResponse: jest.fn().mockReturnValue({
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      }),
      getRequest: jest.fn().mockReturnValue({
        method: 'GET',
        url: '/test', // Mock the request URL
      }),
    } as any;

    const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    filter.catch(exception, mockArgumentsHost);

    // Now verify the reply method is called on the mock httpAdapter
    expect(httpAdapterHost.httpAdapter.reply).toHaveBeenCalledWith(
      mockArgumentsHost.switchToHttp().getResponse(),
      expect.objectContaining({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Forbidden',
        method: 'GET',
        path: '/test',
        timestamp: expect.any(String),  // Timestamp should be a valid string
      }),
      HttpStatus.FORBIDDEN,
    );
  });
});
