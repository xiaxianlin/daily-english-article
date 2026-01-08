import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateMemoryItemDto {
  @ApiProperty({
    example: 'expression',
    enum: ['sentencePattern', 'concept', 'expression'],
  })
  @IsEnum(['sentencePattern', 'concept', 'expression'])
  @IsNotEmpty()
  type: 'sentencePattern' | 'concept' | 'expression';

  @ApiProperty({
    example: 'This suggests that...',
    description: 'The content to remember',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    example: 'From the article about AI in healthcare',
    description: 'Context of where this came from',
  })
  @IsString()
  @IsNotEmpty()
  context: string;

  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Source article ID',
  })
  @IsString()
  @IsNotEmpty()
  sourceArticleId: string;
}
