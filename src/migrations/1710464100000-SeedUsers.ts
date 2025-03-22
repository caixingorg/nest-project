import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export class SeedUsers1710464100000 {
  public async up(): Promise<void> {
    // This is now handled by Prisma
    // For seeding with Prisma, you would typically use:
    // npx prisma db seed
    // Example of how to seed with Prisma:
    try {
      const prisma = new PrismaClient();
      // Hash passwords
      const salt = await bcrypt.genSalt();
      const adminPassword = await bcrypt.hash('admin123', salt);
      const userPassword = await bcrypt.hash('user123', salt);
      // Create admin user
      await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
          username: 'admin',
          password: adminPassword,
          fullName: 'Admin User',
          email: 'admin@example.com',
          isActive: true,
          roles: 'admin,user',
        },
      });
      // Create regular user
      await prisma.user.upsert({
        where: { username: 'user' },
        update: {},
        create: {
          username: 'user',
          password: userPassword,
          fullName: 'Regular User',
          email: 'user@example.com',
          isActive: true,
          roles: 'user',
        },
      });
      await prisma.$disconnect();
      console.log('Seed completed with Prisma');
    } catch (error) {
      console.error('Error seeding database:', error);
    }
  }

  public async down(): Promise<void> {
    try {
      const prisma = new PrismaClient();
      await prisma.user.deleteMany({
        where: {
          username: {
            in: ['admin', 'user'],
          },
        },
      });
      await prisma.$disconnect();
      console.log('Seed rollback completed with Prisma');
    } catch (error) {
      console.error('Error rolling back seed:', error);
    }
  }
}
