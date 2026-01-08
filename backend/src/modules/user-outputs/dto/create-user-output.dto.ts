import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateUserOutputDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Article ID',
  })
  @IsString()
  @IsNotEmpty()
  articleId: string;

  @ApiProperty({
    example: 'Explain the article\'s main argument in 2-3 sentences.',
    description: 'The prompt for the user output',
  })
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @ApiProperty({
    example: 'The article demonstrates that AI can revolutionize healthcare by improving diagnosis accuracy and reducing costs.',
    description: 'User\'s response to the prompt',
  })
  @IsString()
  @IsNotEmpty()
  userOutput: string;

  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    required: false,
    description: 'Reading session ID (optional)',
  })
  @IsString()
  sessionId?: string;
}
