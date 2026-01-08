import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
  IsArray,
  ArrayMaxSize,
} from 'class-validator';

export class EnglishLevel {
  static readonly A2 = 'A2';
  static readonly B1 = 'B1';
  static readonly B2 = 'B2';
}

export class CreateUserDto {
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

  @ApiProperty({ enum: ['A2', 'B1', 'B2'], default: 'B1', required: false })
  @IsEnum(['A2', 'B1', 'B2'])
  @IsOptional()
  englishLevel?: 'A2' | 'B1' | 'B2';

  @ApiProperty({
    example: ['AI', 'finance', 'economics'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  @IsOptional()
  interests?: string[];
}
