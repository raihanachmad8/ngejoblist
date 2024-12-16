
import { TransformResponseInterceptor } from './response.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { Test, TestingModule } from '@nestjs/testing';

describe('TransformResponseInterceptor', () => {
  let interceptor: TransformResponseInterceptor<any>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransformResponseInterceptor],
    }).compile();

    interceptor = module.get<TransformResponseInterceptor<any>>(TransformResponseInterceptor);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should transform the response correctly', (done) => {
    const mockData = { message: 'Custom message', someData: 'data' };
    const mockResponse = {
      statusCode: 200,
    };

    const mockExecutionContext = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as ExecutionContext;

    const mockCallHandler = {
      handle: () => of(mockData),
    } as CallHandler;

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe((result) => {
      expect(result).toEqual({
        statusCode: 200,
        message: 'Custom message',
        timestamp: expect.any(String),
        data: { someData: 'data' },
      });
      done();
    });
  });

  it('should use default message if none is provided', (done) => {
    const mockData = { someData: 'data' };
    const mockResponse = {
      statusCode: 200,
    };

    const mockExecutionContext = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as ExecutionContext;

    const mockCallHandler = {
      handle: () => of(mockData),
    } as CallHandler;

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe((result) => {
      expect(result).toEqual({
        statusCode: 200,
        message: 'Success',
        timestamp: expect.any(String),
        data: { someData: 'data' },
      });
      done();
    });
  });
});