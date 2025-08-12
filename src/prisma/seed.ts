import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env['DATABASE_URL'];
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 12);
  
  const regularUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Regular User',
      password: userPassword,
      role: 'USER',
    },
  });

  console.log('✅ Regular user created:', regularUser.email);

  // Create sample posts
  const posts = await Promise.all([
    prisma.post.upsert({
      where: { id: 'post-1' },
      update: {},
      create: {
        id: 'post-1',
        title: 'Welcome to SL-NIC-Bridge API',
        content: 'This is the first post in our API. Welcome!',
        published: true,
        authorId: adminUser.id,
      },
    }),
    prisma.post.upsert({
      where: { id: 'post-2' },
      update: {},
      create: {
        id: 'post-2',
        title: 'Getting Started with the API',
        content: 'Learn how to use our API endpoints effectively.',
        published: true,
        authorId: regularUser.id,
      },
    }),
  ]);

  console.log('✅ Sample posts created:', posts.length);

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 