// import { PrismaClient, Prisma } from '@prisma/client';
// import dotenv from 'dotenv';

// dotenv.config();

// export type ExtendedPrismaClient = ReturnType<typeof getExtendedPrismaClient>;

// declare global {
//   var db: ExtendedPrismaClient | undefined;
// }

// const databaseUrl = process.env['DATABASE_URL'];
// if (!databaseUrl) {
//   throw new Error('DATABASE_URL environment variable is required');
// }

// // Configure Prisma Client
// const prismaConfig: Prisma.PrismaClientOptions = {
//   log: process.env['NODE_ENV'] === 'development' 
//     ? ['query', 'info', 'warn', 'error'] 
//     : ['warn', 'error'],
//   datasources: {
//     db: {
//       url: databaseUrl,
//     },
//   },
// };

// // Create Prisma Client with extensions
// function getExtendedPrismaClient(config: Prisma.PrismaClientOptions) {
//   const prisma = new PrismaClient(config);
  
//   return prisma.$extends({
//     query: {
//       async $allOperations({ operation, model, args, query }) {
//         const start = performance.now();
//         const result = await query(args);
//         const end = performance.now();
        
//         if (process.env['NODE_ENV'] === 'development' && model) {
//           console.log(`Query ${model}.${operation} took ${(end - start).toFixed(2)}ms`);
//         }
        
//         return result;
//       },
//     },
//   });
// }

// const db = globalThis.db || getExtendedPrismaClient(prismaConfig);

// process.on('beforeExit', async () => {
//   if (db) {
//     await db.$disconnect();
//   }
// });

// if (process.env['NODE_ENV'] !== 'production') {
//   globalThis.db = db;
// }

// export { db };

import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

export const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

prisma.$on('error', (e) => {
  logger.error('Database error:', e);
});

prisma.$on('warn', (e) => {
  logger.warn('Database warning:', e);
});

prisma.$on('info', (e) => {
  logger.info('Database info:', e);
});

prisma.$on('query', (e) => {
  if (process.env['NODE_ENV'] === 'development') {
    logger.debug('Database query:', {
      query: e.query,
      params: e.params,
      duration: e.duration + 'ms',
    });
  }
});

export const connectDatabase = async () => {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error('Database connection error:', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async () => {
  try {
    await prisma.$disconnect();
    logger.info('Database disconnected successfully');
  } catch (error) {
    logger.error('Database disconnection error:', error);
  }
};