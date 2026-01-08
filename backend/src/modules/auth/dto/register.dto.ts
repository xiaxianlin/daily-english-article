import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'B1', required: false, enum: ['A2', 'B1', 'B2'] })
  @IsEnum(['A2', 'B1', 'B2'])
  @IsOptional()
  englishLevel?: 'A2' | 'B1' | 'B2';
}
