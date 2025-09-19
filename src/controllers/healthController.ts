// import { Request, Response } from 'express';
// import { BaseController } from './baseController';
// import { HealthRepository } from '../repositories';
// import { HealthCheckSuccessDto, HealthCheckErrorDto } from '../types/dto';

// export class HealthController extends BaseController {
//   private static healthRepository = new HealthRepository();

//   // Health check endpoint
//   static healthCheck = async (_req: Request, res: Response): Promise<Response<HealthCheckSuccessDto | HealthCheckErrorDto>> => {
//     try {
//       // Check database connection
//       await HealthController.healthRepository.checkDatabaseConnection();
      
//       const healthCheck: HealthCheckSuccessDto = {
//         status: 'OK',
//         timestamp: new Date().toISOString(),
//         uptime: process.uptime(),
//         environment: process.env['NODE_ENV'] || 'unknown',
//         database: 'connected',
//       };

//       HealthController.logSuccess('Health check', healthCheck);
//       return res.status(200).json(healthCheck);
//     } catch (error) {
//       HealthController.logError('Health check', error);
      
//       const healthCheck: HealthCheckErrorDto = {
//         status: 'ERROR',
//         timestamp: new Date().toISOString(),
//         uptime: process.uptime(),
//         environment: process.env['NODE_ENV'] || 'unknown',
//         database: 'disconnected',
//         error: error instanceof Error ? error.message : 'Unknown error',
//       };

//       return res.status(503).json(healthCheck);
//     }
//   }
// } 