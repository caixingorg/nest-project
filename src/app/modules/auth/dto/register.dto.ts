import { ApiProperty } from '@nestjs/swagger';

import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'testuser', description: 'Username' })
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @ApiProperty({
    example: 'TestPass!2025',
    description:
      'Password with at least one uppercase letter, one lowercase letter, one number and one special character',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
    },
  )
  password: string;

  @ApiProperty({ example: 'Test User', description: 'Full name' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  fullName: string;

  @ApiProperty({ example: 'test@example.com', description: 'User email' })
  @IsEmail()
  email: string;
}
