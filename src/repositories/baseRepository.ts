import { db } from '../config/database';
import logger from '../config/logger';
import { ExtendedPrismaClient } from '../config/database';

export abstract class BaseRepository {
  protected db: ExtendedPrismaClient;

  constructor() {
    this.db = db;
  }

  /**
   * Handle database errors with proper logging
   */
  protected handleDatabaseError(error: any, operation: string, entity: string): never {
    logger.error(`Database error in ${operation} ${entity}`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      operation,
      entity,
    });

    // Re-throw the error for controller handling
    throw error;
  }

  /**
   * Execute a database operation with error handling
   */
  protected async executeQuery<T>(
    operation: () => Promise<T>,
    operationName: string,
    entity: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      this.handleDatabaseError(error, operationName, entity);
    }
  }

  /**
   * Check if a record exists
   */
  protected async exists(operation: () => Promise<any>, operationName: string, entity: string): Promise<boolean> {
    try {
      const result = await operation();
      return result !== null;
    } catch (error) {
      this.handleDatabaseError(error, operationName, entity);
    }
  }
} 