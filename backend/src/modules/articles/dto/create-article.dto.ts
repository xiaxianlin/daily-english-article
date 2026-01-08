import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsArray,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class ArticleDifficulty {
  static readonly BEGINNER = 'beginner';
  static readonly INTERMEDIATE = 'intermediate';
  static readonly ADVANCED = 'advanced';
}

export class ArticleDomain {
  static readonly AI = 'AI';
  static readonly FINANCE = 'finance';
  static readonly ECONOMICS = 'economics';
  static readonly TECHNOLOGY = 'technology';
  static readonly SOCIOLOGY = 'sociology';
}

export class CreateArticleDto {
  @ApiProperty({ example: 'The Future of Artificial Intelligence in Healthcare' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    enum: ['AI', 'finance', 'economics', 'technology', 'sociology'],
    example: 'AI',
  })
  @IsEnum(['AI', 'finance', 'economics', 'technology', 'sociology'])
  domain: string;

  @ApiProperty({
    enum: ['beginner', 'intermediate', 'advanced'],
    example: 'intermediate',
  })
  @IsEnum(['beginner', 'intermediate', 'advanced'])
  difficulty: string;

  @ApiProperty({
    example: 'Artificial intelligence is revolutionizing healthcare...',
    description: 'The full text content of the article',
  })
  @IsString()
  content: string;

  @ApiProperty({ example: 450, description: 'Word count of the article' })
  @IsNumber()
  wordCount: number;

  @ApiProperty({
    example: 'https://example.com/article',
    required: false,
    description: 'Original source URL',
  })
  @IsUrl()
  @IsOptional()
  sourceUrl?: string;

  @ApiProperty({
    example: 'Dr. John Smith',
    required: false,
  })
  @IsString()
  @IsOptional()
  author?: string;

  @ApiProperty({
    example: ['AI', 'healthcare', 'innovation'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    example: '2024-01-15T00:00:00.000Z',
    required: false,
    description: 'Schedule the article for a specific date',
  })
  @IsOptional()
  scheduledFor?: Date;
}
