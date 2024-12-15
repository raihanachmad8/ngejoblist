import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, path, body } = req;

    console.log(`[${new Date().toISOString()}] ${method} ${path}`);

    // Log body untuk request POST/PUT (berhati-hati dengan data sensitif)
    if (method === 'POST' || method === 'PUT') {
      console.log('Request Body:', JSON.stringify(body, null, 2));
    }

    next();
  }
}
