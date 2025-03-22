import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { User } from '../../user/entities/user.entity';
import { User as PrismaUser } from '@prisma/client';

@Injectable()
export class PrismaAuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByUsername(username: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return null;
    }

    return this.mapPrismaUserToEntity(user);
  }

  async findUserById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    return this.mapPrismaUserToEntity(user);
  }

  private mapPrismaUserToEntity(prismaUser: PrismaUser): User {
    const user = new User();
    user.id = prismaUser.id;
    user.username = prismaUser.username;
    user.password = prismaUser.password;
    user.fullName = prismaUser.fullName;
    user.email = prismaUser.email;
    user.isActive = prismaUser.isActive;
    user.roles = prismaUser.roles ? prismaUser.roles.split(',') : [];
    user.createdAt = prismaUser.createdAt;
    user.updatedAt = prismaUser.updatedAt;

    return user;
  }
}
