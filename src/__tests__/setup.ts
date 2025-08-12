// Test setup file
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env['NODE_ENV'] = 'test';
process.env['DATABASE_URL'] = process.env['TEST_DATABASE_URL'] || 'postgresql://test:test@localhost:5432/test_db';

// Global test timeout
jest.setTimeout(30000); 