import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      this.logger.warn('Authorization header missing');
      throw new UnauthorizedException('Token is missing');
    }

    if (!authHeader.startsWith('Bearer ')) {
      this.logger.warn('Invalid authorization format');
      throw new UnauthorizedException('Invalid token format');
    }

    try {
      const authServiceUrl = this.configService.get('AUTH_SERVICE_URL');
      this.logger.log(`Validating token with Auth Service: ${authServiceUrl}`);

      const response = await firstValueFrom(
        this.httpService.get(`${authServiceUrl}/auth/validate`, {
          headers: { Authorization: authHeader },
        }),
      );

      request.user = response.data;
      this.logger.log(`Token valid for user: ${response.data.email}`);

      return true;
    } catch (error) {
      this.logger.error(`Token validation failed: ${error.message}`);

      if (error.response?.status === 401) {
        throw new UnauthorizedException('Invalid token');
      }

      throw new UnauthorizedException('Token validation failed');
    }
  }
}
