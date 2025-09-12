import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import { config } from './config/environment';
import { logger } from './config/logger';
import { errorHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';
import routes from './routes';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-user-role'],
}));

// Compression middleware
app.use(compression());

// Rate limiting
app.use(generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.method === 'POST' || req.method === 'PUT' ? req.body : undefined,
  });
  next();
});

// Static files serving

// Static files serving
app.use('/api/v1/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res) => {   
    //Use this to fix CORS issue with loading images in some browsers
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));


// API routes
app.use('/api/v1', routes);


// 404 handler
app.use('*_404', (_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      code: 'NOT_FOUND',
    },
  });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;