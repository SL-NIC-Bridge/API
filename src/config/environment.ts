import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env['PORT'] || '3000', 10),
  nodeEnv: process.env['NODE_ENV'] || 'development',
  
  database: {
    url: process.env['DATABASE_URL'] || '',
  },
  
  jwt: {
    secret: process.env['JWT_SECRET'] || 'your-super-secret-jwt-key-here',
    expiresIn: process.env['JWT_EXPIRES_IN'] || '7d',
    refreshSecret: process.env['JWT_REFRESH_SECRET'] || 'refresh-secret-key',
    refreshExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] || '30d',
  },
  
  email: {
    host: process.env['SMTP_HOST'] || '',
    port: parseInt(process.env['SMTP_PORT'] || '587', 10),
    user: process.env['SMTP_USER'] || '',
    password: process.env['SMTP_PASSWORD'] || '',
  },
  
  storage: {
    type: process.env['STORAGE_TYPE'] || 'local', // 'local' or 's3'
    uploadPath: process.env['UPLOAD_PATH'] || './uploads',
    s3: {
      bucket: process.env['S3_BUCKET'] || '',
      region: process.env['S3_REGION'] || '',
      accessKeyId: process.env['S3_ACCESS_KEY_ID'] || '',
      secretAccessKey: process.env['S3_SECRET_ACCESS_KEY'] || '',
    },
  },
  
  logging: {
    level: process.env['LOG_LEVEL'] || 'info',
    filePath: process.env['LOG_FILE_PATH'] || 'logs',
  },
  
  cors: {
    origin: process.env['CORS_ORIGIN'] || 'http://localhost:3000',
  },
  
  rateLimit: {
    windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000', 10),
    maxRequests: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100', 10),
  },
};