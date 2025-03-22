import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaUserRepository } from './repositories/prisma-user.repository';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly prismaUserRepository: PrismaUserRepository) {
    this.logger.log('UserService initialized with Prisma');
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if username or email already exists
    const existingUser = await this.findByUsernameOrEmail(
      createUserDto.username,
      createUserDto.email,
    );

    if (existingUser) {
      if (existingUser.username === createUserDto.username) {
        throw new ConflictException('Username already exists');
      }
      if (existingUser.email === createUserDto.email) {
        throw new ConflictException('Email already exists');
      }
    }

    // Ensure roles is an array
    if (!createUserDto.roles) {
      createUserDto.roles = ['user'];
    }

    try {
      const user = await this.prismaUserRepository.create(createUserDto);
      this.logger.debug(`User created with Prisma: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    try {
      const users = await this.prismaUserRepository.findAll();
      users.forEach((user) => {
        // const { password: _, ...user } = user;
        if (user.password) {
          user.password = '_';
        }
      });
      console.log('findAll-users', users);
      return users;
    } catch (error) {
      this.logger.error(
        `Error finding all users: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findById(id: string): Promise<User> {
    try {
      console.log('findById-id=========', id);
      const user = await this.prismaUserRepository.findById(id);
      console.log('findById-user========', user);

      if (!user) {
        throw new NotFoundException('user.not_found');
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error finding user by ID: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    console.log('findByUsername-username', username);
    try {
      return this.prismaUserRepository.findByUsername(username);
    } catch (error) {
      this.logger.error(
        `Error finding user by username: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findByUsernameOrEmail(
    username: string,
    email: string,
  ): Promise<User | null> {
    try {
      return this.prismaUserRepository.findByUsernameOrEmail(username, email);
    } catch (error) {
      this.logger.error(
        `Error finding user by username or email: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // First check if user exists
    const user = await this.findById(id);

    // Check if username or email already exists (if being updated)
    if (updateUserDto.username || updateUserDto.email) {
      const existingUser = await this.findByUsernameOrEmail(
        updateUserDto.username || '',
        updateUserDto.email || '',
      );

      if (existingUser && existingUser.id !== id) {
        if (
          updateUserDto.username &&
          existingUser.username === updateUserDto.username
        ) {
          throw new ConflictException('Username already exists');
        }
        if (updateUserDto.email && existingUser.email === updateUserDto.email) {
          throw new ConflictException('Email already exists');
        }
      }
    }

    try {
      const updatedUser = await this.prismaUserRepository.update(
        id,
        updateUserDto,
      );
      this.logger.debug(`User updated with Prisma: ${id}`);
      return updatedUser;
    } catch (error) {
      this.logger.error(`Error updating user: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    // First check if user exists
    await this.findById(id);

    try {
      await this.prismaUserRepository.remove(id);
      this.logger.debug(`User removed with Prisma: ${id}`);
    } catch (error) {
      this.logger.error(`Error removing user: ${error.message}`, error.stack);
      throw error;
    }
  }
}
