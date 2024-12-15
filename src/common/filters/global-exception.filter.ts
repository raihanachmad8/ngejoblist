import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { LoggerService } from '../../core/logger/logger.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly logger: LoggerService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();

    // Tentukan status HTTP
    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Format response body
    const responseBody: any = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: this.getErrorMessage(exception), // Mendapatkan pesan error
    };

    // Jika ada details, tambahkan ke responseBody
    const errorDetails = this.getErrorDetails(exception);
    if (errorDetails) {
      responseBody.details = errorDetails; // Tambahkan details hanya jika ada
    }

    // Log error dengan metadata tambahan
    this.logger.logWithMeta('error', 'Exception occurred', {
      statusCode: responseBody.statusCode,
      path: responseBody.path,
      method: responseBody.method,
      error: exception instanceof Error ? exception.stack : String(exception),
    });

    // Mengirimkan response error ke client
    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }

  // Memperoleh pesan error
  private getErrorMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      return typeof response === 'string'
        ? response
        : (response as any).message;
    }

    if (exception instanceof Error) {
      return exception.message;
    }

    return String(exception);
  }

  // Memperoleh detail error tambahan (misalnya field yang gagal divalidasi)
  private getErrorDetails(exception: unknown): any {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'object' && response && 'errors' in response) {
        return response['errors']; // Mengambil error detail jika ada
      }
    }
    return null; // Tidak mengembalikan apapun jika tidak ada details
  }
}
