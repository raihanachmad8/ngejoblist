import { registerAs } from '@nestjs/config';
import { DatabaseConfig } from '../types/env.type';
import path from 'path';

export default registerAs<DatabaseConfig>('database', () => ({
  url: process.env.DATABASE_URL || '', 
  host: process.env.DB_HOST || 'localhost',  
  port: parseInt(process.env.DB_PORT || '5432', 10), 
  username: process.env.DB_USERNAME || '',  
  password: process.env.DB_PASSWORD || '',  
  database: process.env.DB_NAME || '',  
  logging: process.env.DB_LOGGING === 'true',  
  synchronize: process.env.DB_SYNCHRONIZE === 'true',  
  timezone: process.env.DB_TIMEZONE || 'UTC',  
}));
