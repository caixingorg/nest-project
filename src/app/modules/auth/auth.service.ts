import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { PrismaAuthRepository } from './repositories/prisma-auth.repository';
import { hash, verify, argon2id } from 'argon2';

/**
 * 认证服务
 * 负责用户注册、登录、令牌管理及认证相关业务逻辑
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prismaAuthRepository: PrismaAuthRepository,
  ) {
    this.logger.log('AuthService initialized with Prisma');
  }

  /**
   * 用户注册
   * @param registerDto 注册数据传输对象
   * @returns 包含访问令牌和用户信息的对象
   * @throws InternalServerErrorException 注册失败时抛出
   *
   * 实现逻辑：
   * 1. 使用 Argon2 算法哈希密码
   * 2. 创建新用户记录
   * 3. 生成 JWT 访问令牌
   * 4. 返回令牌和脱敏后的用户信息
   */
  async register(
    registerDto: RegisterDto,
  ): Promise<{ accessToken: string; user: any }> {
    try {
      const hashedPassword = await hash(registerDto.password, {
        type: argon2id,
        memoryCost: 65536,
        parallelism: 1,
        timeCost: 3,
      });

      const createdUser = await this.userService.create({
        ...registerDto,
        password: hashedPassword,
        roles: ['user'],
        isActive: true,
      });

      const payload: JwtPayload = {
        sub: createdUser.id,
        username: createdUser.username,
        roles: [createdUser.roles], // 修改为数组
      };

      return {
        accessToken: this.jwtService.sign(payload),
        user: {
          id: createdUser.id,
          username: createdUser.username,
          fullName: createdUser.fullName,
          email: createdUser.email,
          roles: [createdUser.roles], // 修改为数组
          isActive: createdUser.isActive,
        },
      };
    } catch (error) {
      this.logger.error(
        `Error during registration: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to register');
    }
  }

  /**
   * 验证用户凭证
   * @param username 用户名
   * @param password 密码
   * @returns 脱敏后的用户信息或 null
   *
   * 实现逻辑：
   * 1. 根据用户名查询用户
   * 2. 验证密码哈希
   * 3. 移除敏感字段后返回用户信息
   */
  async validateUser(username: string, password: string): Promise<any> {
    try {
      this.logger.debug(`Finding user by username: ${username}`);
      const user = await this.userService.findByUsername(username);
      if (!user) {
        this.logger.debug(`User not found: ${username}`);
        return null;
      }

      this.logger.debug(`Verifying password for user: ${username}`);
      const isPasswordValid = await verify(user.password, password);
      if (!isPasswordValid) {
        this.logger.debug(`Invalid password for user: ${username}`);
        return null;
      }

      // Remove password from returned user object
      const { password: _, ...result } = user;
      this.logger.debug(`User validated successfully: ${username}`);
      return result;
    } catch (error) {
      this.logger.error(`Error validating user: ${error.message}`, error.stack);
      return null;
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const { username, password } = loginDto;
      // Remove sensitive data from logs
      const { password: _, ...logSafeLoginDto } = loginDto;
      this.logger.debug('loginDto', logSafeLoginDto);
      const user = await this.validateUser(username, password);
      // Remove sensitive data from logs
      this.logger.debug('user authenticated successfully');

      if (!user) {
        this.logger.debug('User not found or invalid credentials');
        throw new UnauthorizedException('auth.invalid_credentials');
      }

      const payload: JwtPayload = {
        sub: user.id ?? '',
        username: user.username ?? '',
        roles: [user.roles], // 修改为数组
      };

      return {
        accessToken: this.jwtService.sign(payload),
        user,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`Error during login: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to login');
    }
  }

  async refreshToken(userId: string) {
    try {
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new UnauthorizedException('auth.invalid_credentials');
      }

      const payload: JwtPayload = {
        sub: user.id ?? '',
        username: user.username ?? '',
        roles: [user.roles], // 修改为数组
      };

      return {
        accessToken: this.jwtService.sign(payload),
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(
        `Error refreshing token: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to refresh token');
    }
  }

  async logout(userId: string, token: string) {
    try {
      // 1. 将当前令牌加入黑名单（剩余有效期内失效）
      await this.prismaAuthRepository.addToBlacklist(token);

      // 2. 更新用户最后登出时间
      await this.userService.updateLastLogout(userId);

      // 3. 清除refresh token（如果有实现）
      // await this.prismaAuthRepository.clearRefreshToken(userId);

      this.logger.debug(`User logged out: ${userId}, token blacklisted`);
      return {
        success: true,
        message: 'auth.logout_success',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Error during logout: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to logout');
    }
  }
}
