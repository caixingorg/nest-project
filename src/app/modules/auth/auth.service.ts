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
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { PrismaAuthRepository } from './repositories/prisma-auth.repository';
import * as bcrypt from 'bcrypt';

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

  async validateUser(username: string, password: string): Promise<any> {
    try {
      const user = await this.userService.findByUsername(username);
      if (!user) {
        return null;
      }

      let isPasswordValid = false;
      try {
        // First try to validate with bcrypt (for hashed passwords)
        isPasswordValid = await bcrypt.compare(password, user.password);
      } catch (e) {
        // If bcrypt.compare fails (e.g., the stored password is not a bcrypt hash),
        // we'll check if the plain passwords match (for legacy users)
        this.logger.warn(
          `Bcrypt compare failed, trying plain text comparison for user: ${username}`,
        );
        isPasswordValid = password === user.password;
        // If plain text passwords match, update the user's password to be hashed
        if (isPasswordValid) {
          this.logger.log(`Updating password hash for user: ${username}`);
          const hashedPassword = await bcrypt.hash(password, 10);
          await this.userService.update(user.id, { password: hashedPassword });
        }
      }
      if (!isPasswordValid) {
        return null;
      }

      // Remove password from returned user object
      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      this.logger.error(`Error validating user: ${error.message}`, error.stack);
      return null;
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const { username, password } = loginDto;
      console.log('loginDto', loginDto);
      const user = await this.validateUser(username, password);
      console.log('user', user);

      if (!user) {
        throw new UnauthorizedException('auth.invalid_credentials');
      }

      const payload: JwtPayload = {
        sub: user.id,
        username: user.username,
        roles: user.roles,
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
        sub: user.id,
        username: user.username,
        roles: user.roles,
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

  logout(userId: string) {
    try {
      // In a real-world application, you might want to:
      // 1. Add the token to a blacklist
      // 2. Clear any refresh tokens
      // 3. Update the user's last logout timestamp

      // For this implementation, we'll just return a success message
      // since JWT tokens are stateless and can't be invalidated on the server
      // without additional mechanisms like a token blacklist

      this.logger.debug(`User logged out: ${userId}`);
      return {
        success: true,
        message: 'auth.logout_success',
      };
    } catch (error) {
      this.logger.error(`Error during logout: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to logout');
    }
  }
}
