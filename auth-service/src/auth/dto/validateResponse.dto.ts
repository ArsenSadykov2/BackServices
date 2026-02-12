import { ApiProperty } from '@nestjs/swagger';

export class ValidateResponseDto {
  @ApiProperty({ example: true })
  valid: boolean;

  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ example: 'user@example.com' })
  email: string;
}
