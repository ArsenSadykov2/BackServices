import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    example: 'My First Post',
    description: 'Post title',
  })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MinLength(3, { message: 'Title must be at least 3 characters' })
  title: string;

  @ApiProperty({
    example: 'This is the content of my post...',
    description: 'Post content',
  })
  @IsString()
  @IsNotEmpty({ message: 'Content is required' })
  content: string;
}
