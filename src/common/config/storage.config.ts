import { registerAs } from '@nestjs/config';
import { StorageConfig } from '../types/env.type';

export default registerAs<StorageConfig>('storage', () => ({
  driver: process.env.STORAGE_DRIVER as 'local' | 's3' | 'gcs' || 'local',
  local: {
    uploadPath: process.env.LOCAL_UPLOAD_PATH || 'uploads',  
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '50', 10),  
  },
  s3: process.env.STORAGE_DRIVER === 's3' ? {
    bucket: process.env.S3_BUCKET || '',  
    region: process.env.S3_REGION || '',  
    accessKey: process.env.S3_ACCESS_KEY || '',  
    secretKey: process.env.S3_SECRET_KEY || '',  
  } : undefined,  
}));
