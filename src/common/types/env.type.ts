export interface AppConfig {
  name: string;
  env: 'development' | 'production' | 'test';
  port: number;
  apiPrefix: string;
  debug: boolean;
  timezone: string;
}

export interface DatabaseConfig {
  url: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  logging: boolean;
  synchronize: boolean;
  timezone: string;
}

export interface AuthConfig {
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessExpiration: string;
    refreshExpiration: string;
  };
  bcrypt: {
    saltRounds: number;
  };
}

export interface SecurityConfig {
  cors: {
    origins: string[];
    methods: string[];
    allowedHeaders: string[];
  };
  trustedProxies: string[];
  rateLimit: {
    ttl: number;
    limit: number;
    duration: number;
  };
  helmet: {
    enabled: boolean;
    contentSecurityPolicy: boolean;
  };
}

export interface EmailConfig {
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    username: string;
    password: string;
  };
  from: {
    name: string;
    email: string;
  };
}

export interface StorageConfig {
  driver: 'local' | 's3' | 'gcs' | 'cloudinary';
  local?: {
    uploadPath: string;
    maxFileSize: number; // MB
  };
  s3?: {
    bucket: string;
    region: string;
    accessKey: string;
    secretKey: string;
  };
}

export interface LoggingConfig {
  level: 'error' | 'warn' | 'info' | 'debug';
  format: 'json' | 'simple';
  destination: 'console' | 'file' | 'both';
  filePath?: string;
  maxSize?: string; // '10M'
  maxFiles?: number;
}


export interface LoggingConfig {
  level: 'error' | 'warn' | 'info' | 'debug';
  format: 'json' | 'simple';
  destination: 'console' | 'file' | 'both';
  filePath?: string;
  maxSize?: string; // '10M'
  maxFiles?: number;
}
