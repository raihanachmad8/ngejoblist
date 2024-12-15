import { registerAs } from '@nestjs/config';
import { AppConfig } from '../types/env.type';

export default registerAs<AppConfig>('app', () => ({
  name: process.env.APP_NAME || 'Ngejoblist',  
  env: process.env.NODE_ENV as 'development' | 'production' | 'test' || 'development',  
  port: parseInt(process.env.PORT || '3000', 10),  
  apiPrefix: process.env.API_PREFIX || 'api',  
  debug: process.env.DEBUG === 'true',  
  timezone: process.env.TIMEZONE || 'UTC',  
}));
