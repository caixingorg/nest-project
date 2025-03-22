import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { PrismaAuthRepository } from '../repositories/prisma-auth.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly prismaAuthRepository: PrismaAuthRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });

    this.logger.log('JwtStrategy initialized with Prisma');
  }

  async validate(payload: JwtPayload) {
    try {
      const { sub: id } = payload;

      const user = await this.userService.findById(id);

      if (!user) {
        throw new UnauthorizedException('errors.unauthorized');
      }

      // Remove password from returned user object
      const { password, ...result } = user;
      return {
        ...result,
        roles: user.roles,
      };
    } catch (error) {
      this.logger.error(`Error validating JWT: ${error.message}`, error.stack);
      throw new UnauthorizedException('errors.unauthorized');
    }
  }
}
