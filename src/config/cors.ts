import { CorsOptions } from 'cors';

// Parse multiple origins from environment variable (comma-separated)
const getAllowedOrigins = (): string[] => {
  const envOrigins = process.env['CORS_ORIGIN'];
  
  if (envOrigins) {
    // Split by comma and trim whitespace
    return envOrigins.split(',').map(origin => origin.trim());
  }
  
  // Default allowed origins for development
  return [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173', // Vite default
    'http://localhost:5174',
    'http://localhost:8080', // Flutter web default
    'http://localhost:8081',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:8080', // Flutter web default
    'http://127.0.0.1:8081'
  ];
};

const allowedOrigins = getAllowedOrigins();

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in the allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Allow localhost and local network IPs in development
    if (process.env['NODE_ENV'] !== 'production') {
      if (origin.includes('localhost') || 
          origin.match(/^https?:\/\/192\.168\.\d+\.\d+/) ||
          origin.match(/^https?:\/\/10\.\d+\.\d+\.\d+/) ||
          origin.match(/^https?:\/\/172\.1[6-9]\.\d+\.\d+/) ||
          origin.match(/^https?:\/\/172\.2[0-9]\.\d+\.\d+/) ||
          origin.match(/^https?:\/\/172\.3[0-1]\.\d+\.\d+/)) {
        return callback(null, true);
      }
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Client-Type', // For device detection
    'X-User-ID',     // If still used
    'X-User-Role'    // If still used
  ],
};

export default corsOptions;