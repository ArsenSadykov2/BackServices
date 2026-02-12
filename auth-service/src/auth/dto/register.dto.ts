import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email пользователя',
  })
  @IsEmail({}, { message: 'Невалидный email' })
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Пароль (минимум 6 символов)',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'Пароль должен быть минимум 6 символов' })
  password: string;
}
