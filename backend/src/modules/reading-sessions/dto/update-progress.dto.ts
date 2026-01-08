import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsNumber } from 'class-validator';

export class UpdateProgressDto {
  @ApiProperty({
    example: 'readingMapViewed',
    required: false,
    description: 'The progress field to update',
  })
  @IsString()
  @IsOptional()
  field?: string;

  @ApiProperty({
    example: true,
    required: false,
    description: 'Value for boolean fields',
  })
  @IsOptional()
  booleanValue?: boolean;

  @ApiProperty({
    example: [0, 1, 2],
    required: false,
    description: 'Value for array fields (e.g., keyParagraphsViewed)',
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  arrayValue?: number[];
}
