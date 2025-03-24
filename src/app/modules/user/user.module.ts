import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { USER_REPOSITORY } from './repositories/user.repository';
import { PrismaUserRepository } from './repositories/user.repository';
import { PrismaService } from '../../../prisma/prisma.service'; // 导入 PrismaService

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    PrismaService, // 提供 PrismaService
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [UserService, USER_REPOSITORY, PrismaService], // 导出 PrismaService
})
export class UserModule {}
