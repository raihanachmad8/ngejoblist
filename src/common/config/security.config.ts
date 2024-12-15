import { registerAs } from '@nestjs/config';
import { SecurityConfig } from '../types/env.type';

export default registerAs<SecurityConfig>('security', () => ({
  cors: {
    origins: (process.env.SECURITY_CORS_ORIGINS || '').split(','),  
    methods: (process.env.SECURITY_CORS_METHODS || 'GET,POST').split(','),  
    allowedHeaders: (process.env.SECURITY_CORS_ALLOWED_HEADERS || 'Content-Type,Authorization').split(','),  
  },
  trustedProxies: (process.env.SECURITY_TRUSTED_PROXIES || '').split(','),
  rateLimit: {
    ttl: parseInt(process.env.SECURITY_RATE_LIMIT_TTL || '60', 10) * 1000,
    limit: parseInt(process.env.SECURITY_RATE_LIMIT_POINTS || '10', 10) * 1000, 
    duration: parseInt(process.env.SECURITY_RATE_LIMIT_DURATION || '60', 10) * 1000,
  },
  helmet: {
    enabled: process.env.SECURITY_HELMET_ENABLED === 'true', 
    contentSecurityPolicy: process.env.SECURITY_HELMET_CSP === 'true',
    dnsPrefetchControl: process.env.SECURITY_HELMET_DNS_PREFETCH_CONTROL === 'true',
    frameguard: process.env.SECURITY_HELMET_FRAMEGUARD === 'true',
    hidePoweredBy: process.env.SECURITY_HELMET_HIDE_POWERED_BY === 'true',
    hsts: process.env.SECURITY_HELMET_HSTS === 'true',
    ieNoOpen: process.env.SECURITY_HELMET_IE_NO_OPEN === 'true',
    noCache: process.env.SECURITY_HELMET_NO_CACHE === 'true',
    xssFilter: process.env.SECURITY_HELMET_XSS_FILTER === 'true',
  },
}));
