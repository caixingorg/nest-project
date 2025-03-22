import { PrismaClient } from '@prisma/client';

export class CreateUserTable1710464000000 {
  public async up(): Promise<void> {
    // This migration is now handled by Prisma
    // The schema is defined in prisma/schema.prisma
    const prisma = new PrismaClient();
    await prisma.$connect();
    await prisma.$disconnect();
    console.log('Migration is now handled by Prisma');
  }

  public async down(): Promise<void> {
    // For rollback, you would use Prisma migrations
    const prisma = new PrismaClient();
    await prisma.$connect();
    await prisma.$disconnect();
    console.log('Migration rollback is now handled by Prisma');
  }
}
