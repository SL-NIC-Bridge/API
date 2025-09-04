import * as bcrypt from 'bcryptjs';
import { db } from '../config/database';
import { UserRole, UserAccountStatusEnum } from '@prisma/client';

export async function seedDB() {
  console.log('🌱 Starting database seeding...');

  // Create DS user
  const hashedPasswordDS = await bcrypt.hash('DSadmin@123', 12);

  const dsUser = await db.user.upsert({
    where: { email: 'ds@slnicbridge.lk' },
    update: {},
    create: {
      email: 'ds@slnicbridge.lk',
      firstName: 'DS',
      lastName: 'User',
      phone: '0781234567',
      passwordHash: hashedPasswordDS,
      role: UserRole.DS,
      currentStatus: UserAccountStatusEnum.ACTIVE,
    },
  });

  console.log('✅ DS user seeded:', dsUser.email);

  // Create GN user
  const hashedPasswordGN = await bcrypt.hash('GNadmin@123', 12);

  const gnUser = await db.user.upsert({
    where: { email: 'gn@slnicbridge.lk' },
    update: {},
    create: {
      email: 'gn@slnicbridge.lk',
      firstName: 'GN',
      lastName: 'User',
      phone: '0779876543',
      passwordHash: hashedPasswordGN,
      role: UserRole.GN, // Assuming GN role exists in your UserRole enum
      currentStatus: UserAccountStatusEnum.ACTIVE,
    },
  });

  console.log('✅ GN user seeded:', gnUser.email);
}

seedDB()
  .then(() => {
    console.log('🌱 Database seeding completed successfully!');
  })
  .catch((error) => {
    console.error('❌ Error during database seeding:', error);
  });
