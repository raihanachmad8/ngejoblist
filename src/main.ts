import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { LoggerService } from './core/logger/logger.service';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import helmet from 'helmet';
import { TransformResponseInterceptor } from './common/inteceptors/response.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.setGlobalPrefix('api/v1');

  // Get ConfigService and LoggerService
  const configService = app.get(ConfigService);
  const loggerService = app.get(LoggerService);

  // Setup logger
  app.useLogger(loggerService);

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global filter
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(
    new GlobalExceptionFilter(httpAdapterHost, loggerService),
  );

  // Middleware security: Helmet with custom settings
  const helmetConfig = configService.get('security.helmet');
  if (helmetConfig?.enabled) {
    const helmetOptions = {
      contentSecurityPolicy: helmetConfig.contentSecurityPolicy,
      dnsPrefetchControl: helmetConfig.dnsPrefetchControl,
      frameguard: helmetConfig.frameguard,
      hidePoweredBy: helmetConfig.hidePoweredBy,
      hsts: helmetConfig.hsts,
      ieNoOpen: helmetConfig.ieNoOpen,
      noCache: helmetConfig.noCache,
      xssFilter: helmetConfig.xssFilter,
    };
    app.use(helmet(helmetOptions));
  }

  // Enable CORS (Cross-Origin Resource Sharing)
  const corsOptions = configService.get('security.cors');
  app.enableCors({
    origin: corsOptions?.origins || '*', // allow all origins by default or from config
    methods: corsOptions?.methods || 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders:
      corsOptions?.allowedHeaders || 'Content-Type, Authorization',
  });

  // Enable trusted proxies (e.g., if the app is behind a reverse proxy)
  const trustedProxies = configService.get('security.trustedProxies');
  if (trustedProxies && trustedProxies.length > 0) {
    app.use((req, res, next) => {
      req.app.set('trust proxy', trustedProxies);
      next();
    });
  }

  // Use global Response Interceptor
  app.useGlobalInterceptors(new TransformResponseInterceptor());

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('The API documentation for the application')
    .setVersion('1.0')
    .addServer('http://localhost:3000/api/v1', 'Local development server')
    .setContact(
      'Achmad Raihan Fahrezi Effendy',
      'https://raihanachmad.web.id',
      'raihanachmad8@gmail.com',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Port and start the application
  const port = configService.get<number>('app.port');
  await app.listen(port);
}

bootstrap();
