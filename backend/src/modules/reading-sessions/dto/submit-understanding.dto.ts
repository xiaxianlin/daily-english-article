import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class SubmitUnderstandingDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Question ID',
  })
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @ApiProperty({
    example: 'The author argues that AI will transform healthcare by...',
    description: 'User answer to the understanding question',
  })
  @IsString()
  @IsNotEmpty()
  answer: string;
}
