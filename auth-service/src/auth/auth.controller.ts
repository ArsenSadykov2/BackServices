import {
  Controller,
  Post,
  Body,
  Get,
  Headers,
  UnauthorizedException,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { AuthResponseDto } from './dto/authResponse.dto';
import { ValidateResponseDto } from './dto/validateResponse.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'New user register' })
  @ApiResponse({
    status: 201,
    description: 'New user successfully created',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid username or password' })
  @ApiResponse({ status: 409, description: 'Email is already registered' })
  async register(
    @Body(ValidationPipe) dto: RegisterDto,
  ): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enter' })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged in',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Wrong email or password' })
  async login(@Body(ValidationPipe) dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Updating tokens' })
  @ApiBody({ type: RefreshDto })
  @ApiResponse({
    status: 200,
    description: 'Tokens successfully updated',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(
    @Body(ValidationPipe) dto: RefreshDto,
  ): Promise<AuthResponseDto> {
    return this.authService.refreshTokens(dto.refresh_token);
  }

  @Get('validate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'JWT token validation' })
  @ApiResponse({
    status: 200,
    description: 'Token is valid',
    type: ValidateResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid token' })
  async validate(
    @Headers('authorization') auth: string,
  ): Promise<ValidateResponseDto> {
    if (!auth || !auth.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token is invalid');
    }

    const token = auth.split(' ')[1];
    return this.authService.validateToken(token);
  }
}
