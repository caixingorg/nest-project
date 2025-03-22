import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User as PrismaUser } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PrismaUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword, // Store the hashed password
        roles: Array.isArray(createUserDto.roles)
          ? createUserDto.roles.join(',')
          : createUserDto.roles || '',
      },
    });

    return this.mapPrismaUserToEntity(user);
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany();
    return users.map((user) => this.mapPrismaUserToEntity(user));
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    return this.mapPrismaUserToEntity(user);
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return null;
    }

    return this.mapPrismaUserToEntity(user);
  }

  async findByUsernameOrEmail(
    username: string,
    email: string,
  ): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (!user) {
      return null;
    }

    return this.mapPrismaUserToEntity(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    let rolesValue: string | undefined = undefined;

    if (updateUserDto.roles) {
      rolesValue = Array.isArray(updateUserDto.roles)
        ? updateUserDto.roles.join(',')
        : updateUserDto.roles;
    }

    // If password is being updated, hash it
    const data: any = {
      ...updateUserDto,
      roles: rolesValue,
    };

    if (updateUserDto.password) {
      data.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data,
    });

    return this.mapPrismaUserToEntity(user);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
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
