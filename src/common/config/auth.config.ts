import { registerAs } from '@nestjs/config';
import { AuthConfig } from '../types/env.type';

export default registerAs<AuthConfig>('auth', () => ({
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || '',  
    refreshSecret: process.env.JWT_REFRESH_SECRET || '', 
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m', 
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d', 
  },
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),  
  },
}));
