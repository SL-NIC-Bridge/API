import { BaseRepository } from './baseRepository';

export class HealthRepository extends BaseRepository {
  /**
   * Check database connectivity
   */
  async checkDatabaseConnection(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.handleDatabaseError(error, 'checkDatabaseConnection', 'database');
    }
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats(): Promise<{
    totalUsers: number;
    totalPosts: number;
    adminUsers: number;
    regularUsers: number;
  }> {
    return this.executeQuery(
      async () => {
        const [totalUsers, totalPosts, adminUsers, regularUsers] = await Promise.all([
          this.prisma.user.count(),
          this.prisma.post.count(),
          this.prisma.user.count({ where: { role: 'ADMIN' } }),
          this.prisma.user.count({ where: { role: 'USER' } }),
        ]);

        return {
          totalUsers,
          totalPosts,
          adminUsers,
          regularUsers,
        };
      },
      'getDatabaseStats',
      'database'
    );
  }
} 