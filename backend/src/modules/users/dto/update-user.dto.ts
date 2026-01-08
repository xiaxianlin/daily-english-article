import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsArray, ArrayMaxSize } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ example: 'John Doe', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ enum: ['A2', 'B1', 'B2'], required: false })
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

  @ApiProperty({ example: 'AI', required: false })
  @IsString()
  @IsOptional()
  currentDomain?: string;
}
