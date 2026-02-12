import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshToken } from '../users/entities/refreshToken.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async register(dto: RegisterDto) {
    this.logger.log(`Register try: ${dto.email}`);

    const password_hash = await this.hashPassword(dto.password);
    const user = await this.usersService.create(dto.email, password_hash);

    this.logger.log(`User is already logged: ${user.email} (ID: ${user.id})`);

    const tokens = await this.generateTokens(user.id, user.email);
    await this.saveRefreshToken(user.id, tokens.refresh_token);

    return tokens;
  }

  async login(dto: LoginDto) {
    this.logger.log(`Login try: ${dto.email}`);

    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      this.logger.warn(`User is not found (${dto.email})`);
      throw new UnauthorizedException('Wrong email or password');
    }

    const isPasswordValid = await this.comparePassword(
      dto.password,
      user.password_hash,
    );
    if (!isPasswordValid) {
      this.logger.warn(`Wrong password (${dto.email})`);
      throw new UnauthorizedException('Wrong email or password');
    }

    this.logger.log(`Success: ${user.email} (ID: ${user.id})`);

    const tokens = await this.generateTokens(user.id, user.email);
    await this.saveRefreshToken(user.id, tokens.refresh_token);

    return tokens;
  }

  async refreshTokens(refreshToken: string) {
    this.logger.log('Token refresh try');

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_SECRET'),
      });

      const storedToken = await this.refreshTokenRepository.findOne({
        where: { token: refreshToken, user_id: payload.sub },
      });

      if (!storedToken) {
        this.logger.warn('Refresh token failed.');
        throw new UnauthorizedException('Refresh token failed.');
      }

      if (new Date() > storedToken.expires_at) {
        this.logger.warn('Refresh token expired');
        await this.refreshTokenRepository.remove(storedToken);
        throw new UnauthorizedException('Refresh token expired');
      }

      await this.refreshTokenRepository.remove(storedToken);

      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User is not found');
      }

      this.logger.log(`Token is updated ID: ${user.id}`);

      const tokens = await this.generateTokens(user.id, user.email);
      await this.saveRefreshToken(user.id, tokens.refresh_token);

      return tokens;
    } catch (error) {
      this.logger.error('Token updating error', error.message);
      throw new UnauthorizedException('Unvalid token');
    }
  }

  async validateToken(token: string) {
    this.logger.log('Token validate try');

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User is not found');
      }

      this.logger.log(`Token is valid for ID: ${user.id}`);

      return {
        valid: true,
        userId: user.id,
        email: user.email,
      };
    } catch (error) {
      this.logger.warn(`Invalid token: ${error.message}`);
      throw new UnauthorizedException('Невалидный токен');
    }
  }

  private async generateTokens(userId: number, email: string) {
    const payload = { sub: userId, email };

    const access_token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRES'),
    });

    const refresh_token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES'),
    });

    return { access_token, refresh_token };
  }

  private async saveRefreshToken(userId: number, token: string) {
    const expiresIn = this.configService.get('JWT_REFRESH_EXPIRES');
    const expiresInMs = this.parseExpiry(expiresIn);
    const expires_at = new Date(Date.now() + expiresInMs);

    const refreshToken = this.refreshTokenRepository.create({
      token,
      user_id: userId,
      expires_at,
    });

    await this.refreshTokenRepository.save(refreshToken);
  }

  private parseExpiry(expiry: string): number {
    const value = parseInt(expiry);
    if (expiry.endsWith('d')) return value * 24 * 60 * 60 * 1000;
    if (expiry.endsWith('h')) return value * 60 * 60 * 1000;
    if (expiry.endsWith('m')) return value * 60 * 1000;
    return value * 1000;
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private async comparePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
