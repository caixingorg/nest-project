import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { PrismaAuthRepository } from '../repositories/prisma-auth.repository';

/**
 * JWT 认证策略
 * 1. 继承自 Passport 的 Strategy
 * 2. 负责 JWT 令牌的解析和验证
 * 3. 验证用户是否存在并返回标准化用户信息
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly prismaAuthRepository: PrismaAuthRepository,
  ) {
    super({
      // 从 Authorization 头提取 Bearer Token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 不忽略过期令牌（自动验证过期时间）
      ignoreExpiration: false,
      // 从配置获取 JWT 密钥
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });

    this.logger.log('JwtStrategy initialized with Prisma');
  }

  /**
   * 验证并返回标准化用户信息
   * @param payload 解析后的 JWT 负载
   * @returns 标准化用户对象
   *
   * 实现逻辑：
   * 1. 从 payload 中提取用户 ID
   * 2. 通过用户服务查询用户是否存在
   * 3. 移除敏感字段（如密码）
   * 4. 返回标准化用户信息到请求上下文
   */
  async validate(payload: JwtPayload) {
    try {
      const { sub: id } = payload; // 解构用户ID

      // 通过用户服务查询用户
      const user = await this.userService.findById(id);

      if (!user) {
        throw new UnauthorizedException('errors.unauthorized');
      }

      // 移除密码字段
      const { password, ...result } = user;
      return {
        ...result,
        roles: user.roles, // 附加用户角色信息
      };
    } catch (error) {
      this.logger.error(`JWT 验证失败: ${error.message}`, error.stack);
      throw new UnauthorizedException('errors.unauthorized');
    }
  }
}
