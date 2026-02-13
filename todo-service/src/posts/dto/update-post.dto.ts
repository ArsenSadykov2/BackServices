import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdatePostDto {
  @ApiPropertyOptional({
    example: 'Updated Title',
    description: 'Post title',
  })
  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'Title must be at least 3 characters' })
  title?: string;

  @ApiPropertyOptional({
    example: 'Updated content...',
    description: 'Post content',
  })
  @IsString()
  @IsOptional()
  content?: string;
}
