import { Module } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { UserController } from '../user/user.controller';
import { User } from './entities/user.entity';
import { PrismaUserRepository } from './repositories/prisma-user.repository';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaUserRepository],
  exports: [UserService],
})
export class UserModule {}
