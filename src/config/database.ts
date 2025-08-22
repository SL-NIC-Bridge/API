import { PrismaClient, Prisma } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

export type ExtendedPrismaClient = ReturnType<typeof getExtendedPrismaClient>;

declare global {
  var db: ExtendedPrismaClient | undefined;
}

const databaseUrl = process.env['DATABASE_URL'];
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Configure Prisma Client
const prismaConfig: Prisma.PrismaClientOptions = {
  log: process.env['NODE_ENV'] === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['warn', 'error'],
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
};

// Create Prisma Client with extensions
function getExtendedPrismaClient(config: Prisma.PrismaClientOptions) {
  const prisma = new PrismaClient(config);
  
  return prisma.$extends({
    query: {
      async $allOperations({ operation, model, args, query }) {
        const start = performance.now();
        const result = await query(args);
        const end = performance.now();
        
        if (process.env['NODE_ENV'] === 'development' && model) {
          console.log(`Query ${model}.${operation} took ${(end - start).toFixed(2)}ms`);
        }
        
        return result;
      },
    },
  });
}

const db = globalThis.db || getExtendedPrismaClient(prismaConfig);

process.on('beforeExit', async () => {
  if (db) {
    await db.$disconnect();
  }
});

if (process.env['NODE_ENV'] !== 'production') {
  globalThis.db = db;
}

export { db };