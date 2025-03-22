import { genSalt, hash } from 'bcrypt';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class User {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'Username' })
  username: string;

  @Exclude({ toPlainOnly: true })
  @ApiProperty({ description: 'Password', writeOnly: true })
  password: string;

  @ApiProperty({ description: 'Full name' })
  fullName: string;

  @ApiProperty({ description: 'Email address' })
  email: string;

  @ApiProperty({ description: 'Is user active' })
  isActive: boolean;

  @ApiProperty({ description: 'User roles', type: [String] })
  roles: string[];

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  async hashPassword() {
    // Only hash the password if it has been modified
    if (this.password) {
      const salt = await genSalt();
      this.password = await hash(this.password, salt);
    }
  }
}
