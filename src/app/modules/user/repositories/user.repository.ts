import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { argon2id, hash, verify } from 'argon2';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Hash the password before storing it
    const hashedPassword = await hash(createUserDto.password, {
      type: argon2id,
      memoryCost: 65536,
      parallelism: 1,
      timeCost: 3,
    });
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
      data.password = await hash(updateUserDto.password, {
        type: argon2id,
        memoryCost: 65536,
        parallelism: 1,
        timeCost: 3,
      });
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

  public mapPrismaUserToEntity(prismaUser: PrismaUser): User {
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
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { User } from '../entities/user.entity';
import { User as PrismaUser } from '@prisma/client';

/**
 * 用户仓储接口定义
 */
export const USER_REPOSITORY = 'USER_REPOSITORY';

export interface UserRepository {
  /**
   * 创建新用户
   * @param createUserDto 用户创建DTO
   * @returns 创建后的用户实体
   */
  create(createUserDto: CreateUserDto): Promise<User>;

  /**
   * 获取所有用户
   * @returns 用户实体数组
   */
  findAll(): Promise<User[]>;

  /**
   * 根据ID查找用户
   * @param id 用户ID
   * @returns 用户实体或null
   */
  findById(id: string): Promise<User | null>;

  /**
   * 根据用户名查找用户
   * @param username 用户名
   * @returns 用户实体或null
   */
  findByUsername(username: string): Promise<User | null>;

  /**
   * 根据用户名或邮箱查找用户
   * @param username 用户名
   * @param email 邮箱地址
   * @returns 用户实体或null
   */
  findByUsernameOrEmail(username: string, email: string): Promise<User | null>;

  /**
   * 更新用户信息
   * @param id 用户ID
   * @param updateUserDto 用户更新DTO
   * @returns 更新后的用户实体
   */
  update(id: string, updateUserDto: UpdateUserDto): Promise<User>;

  /**
   * 删除用户
   * @param id 用户ID
   */
  remove(id: string): Promise<void>;

  /**
   * 将Prisma模型转换为用户实体
   * @param prismaUser Prisma用户模型
   * @returns 用户实体
   */
  mapPrismaUserToEntity(prismaUser: PrismaUser): User;
}

@Injectable()
export abstract class AbstractUserRepository implements UserRepository {
  // 抽象方法由具体实现类提供
  abstract create(createUserDto: CreateUserDto): Promise<User>;
  abstract findAll(): Promise<User[]>;
  abstract findById(id: string): Promise<User | null>;
  abstract findByUsername(username: string): Promise<User | null>;

  abstract findByUsernameOrEmail(
    username: string,
    email: string,
  ): Promise<User | null>;

  abstract update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
  abstract remove(id: string): Promise<void>;
  abstract mapPrismaUserToEntity(prismaUser: PrismaUser): User;
}
