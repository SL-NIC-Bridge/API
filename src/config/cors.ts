import { CorsOptions } from 'cors';

const corsOptions: CorsOptions = {
  origin: process.env['CORS_ORIGIN'] || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

export default corsOptions;