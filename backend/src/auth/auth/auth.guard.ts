import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';

export interface PayloadRequest extends Request {
  user: {
    email: string;
    id: number;
    sessionId: string;
  };
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this._extractToken(request);
    if (!token) {
      throw new UnauthorizedException('Unauthorized access');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);

      const session = await this.authService.validateSession(payload.sessionId);
      if (!session) {
        const response = context.switchToHttp().getResponse();
        response.clearCookie('token');
        throw new UnauthorizedException('Session expired or revoked');
      }

      await this.authService.extendSession(payload.sessionId);

      request.user = payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Unauthorized access');
    }

    return true;
  }

  private _extractToken(request: any): string | undefined {
    const cookieToken = request.cookies?.token;
    if (cookieToken) {
      return cookieToken;
    }
    const authHeader = request.headers['authorization'];
    if (authHeader) {
      return authHeader.split(' ')[1];
    }
    return undefined;
  }
}
