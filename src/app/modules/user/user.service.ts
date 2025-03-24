import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async updateLastLogout(userId: string) {
    // 更新用户的最后登出时间
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLogoutAt: new Date() },
    });
  }

  async create(createUserDto: any) {
    // 创建新用户
    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  async findByUsername(username: string) {
    // 根据用户名查找用户
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async findById(id: string) {
    // 根据ID查找用户
    return this.prisma.user.findUnique({
      where: { id: parseInt(id, 10) },
    });
  }

  // 其他方法...
}
