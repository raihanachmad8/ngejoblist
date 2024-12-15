import { registerAs } from '@nestjs/config';
import { LoggingConfig } from '../types/env.type';

export default registerAs<LoggingConfig>('logging', () => ({
  level: process.env.LOG_LEVEL as 'error' | 'warn' | 'info' | 'debug' || 'info',  
  format: process.env.LOG_FORMAT as 'json' | 'simple' || 'json',  
  destination: process.env.LOG_DESTINATION as 'console' | 'file' | 'both' || 'console',  
  filePath: process.env.LOG_FILE_PATH || 'logs',  
  maxSize: process.env.LOG_MAX_SIZE || '10M',  
  maxFiles: parseInt(process.env.LOG_MAX_FILES || '14', 10),  
}));
