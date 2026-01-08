import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryArticlesDto {
  @ApiProperty({
    required: false,
    example: 0,
    description: 'Number of items to skip',
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  offset?: number = 0;

  @ApiProperty({
    required: false,
    example: 10,
    description: 'Number of items to return',
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number = 10;

  @ApiProperty({
    required: false,
    enum: ['AI', 'finance', 'economics', 'technology', 'sociology'],
    example: 'AI',
  })
  @IsOptional()
  @IsEnum(['AI', 'finance', 'economics', 'technology', 'sociology'])
  domain?: string;

  @ApiProperty({
    required: false,
    enum: ['beginner', 'intermediate', 'advanced'],
    example: 'intermediate',
  })
  @IsOptional()
  @IsEnum(['beginner', 'intermediate', 'advanced'])
  difficulty?: string;

  @ApiProperty({
    required: false,
    example: 'AI',
    description: 'Search in title and content',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
