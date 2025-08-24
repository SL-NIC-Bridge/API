// import { BaseRepository } from './baseRepository';
// import {UserRole} from '@prisma/client'

// export class HealthRepository extends BaseRepository<null, null, null> {
//   /**
//    * Check database connectivity
//    */
//   async checkDatabaseConnection(): Promise<boolean> {
//     try {
//       await this.db.$queryRaw`SELECT 1`;
//       return true;
//     } catch (error) {
//       this.handleDatabaseError(error, 'checkDatabaseConnection', 'database');
//     }
//   }

//   /**
//    * Get database statistics
//    */
//   async getDatabaseStats(): Promise<{
//     totalUsers: number;
//     gnUsers: number;
//     standardUsers: number;
//   }> {
//     return this.executeQuery(
//       async () => {
//         const [totalUsers, gnUsers, standardUsers] = await Promise.all([
//           this.db.user.count(),
//           this.db.user.count({ where: { role: UserRole.GN } }),
//           this.db.user.count({ where: { role: UserRole.STANDARD } }),
//         ]);

//         return {
//           totalUsers,
//           gnUsers,
//           standardUsers,
//         };
//       },
//       'getDatabaseStats',
//       'database'
//     );
//   }
// } 