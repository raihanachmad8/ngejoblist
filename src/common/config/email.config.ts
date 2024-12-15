import { registerAs } from '@nestjs/config';
import { EmailConfig } from '../types/env.type';

export default registerAs<EmailConfig>('email', () => ({
  smtp: {
    host: process.env.SMTP_HOST || '',  
    port: parseInt(process.env.SMTP_PORT || '587', 10),  
    secure: process.env.SMTP_SECURE === 'true',  
    username: process.env.SMTP_USERNAME || '',  
    password: process.env.SMTP_PASSWORD || '',  
  },
  from: {
    name: process.env.EMAIL_FROM_NAME || 'Ngejoblist',  
    email: process.env.EMAIL_FROM_EMAIL || 'no-reply@ngejoblist',
  },
}));
