import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  statusCode: number;
  message?: string;
  timestamp: string;
  data: T;
}

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const httpContext = context.switchToHttp();
    const response = httpContext.getResponse();

    return next.handle().pipe(
      map((data) => {
        const message = typeof data === 'object' && data?.message 
          ? data.message 
          : 'Success'; // Gunakan message dari data jika tersedia, atau default
        const responseData = typeof data === 'object' && data?.message
          ? { ...data, message: undefined } // Hilangkan message dari objek data
          : data;

        return {
          data: responseData || null,
          statusCode: response.statusCode,
          message,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
