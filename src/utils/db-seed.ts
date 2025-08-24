import * as bcrypt from 'bcryptjs';
import { db } from '../config/database';
import { UserRole, UserAccountStatusEnum } from '@prisma/client';

export async function seedDB() {
  console.log('🌱 Starting database seeding...');

  // Create DS user
  const hashedPassword = await bcrypt.hash('DSadmin@123', 12);
  
  const dsUser = await db.user.upsert({
    where: { email: 'ds@slnicbridge.lk' },
    update: {},
    create: {
      email: 'ds@slnicbridge.lk',
      firstName: 'DS',
      lastName: 'User',
      phone: '0781234567',
      passwordHash: hashedPassword,
      role: UserRole.DS,
      currentStatus: UserAccountStatusEnum.ACTIVE,
    },
  });

  console.log('✅ DS user seeded:', dsUser.email);
}

seedDB().then(() => {
  console.log('🌱 Database seeding completed successfully!');
}).catch((error) => {
  console.error('❌ Error during database seeding:', error);
});