import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PrismaAuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async addToBlacklist(token: string) {
    // 将令牌加入黑名单
    await this.prisma.tokenBlacklist.create({
      data: {
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天有效期
      },
    });
  }

  // 其他方法...
}
