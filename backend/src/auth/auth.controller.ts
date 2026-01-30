import {
  Controller,
  Post,
  Get,
  Body,
  BadRequestException,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '@user/dto/create-user.dto';
import { UserService } from '@user/user.service';
import { AuthGuard, PayloadRequest } from './auth/auth.guard';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private userService: UserService,
    private configService: ConfigService,
  ) {}

  private setTokenCookie(res: Response, token: string) {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: this.configService.get<number>('SESSION_DURATION_HOURS', 3) * 60 * 60 * 1000,
    });
  }

  @Post('register')
  async create(
    @Body() registerDto: CreateUserDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    registerDto.email = registerDto.email.toLowerCase();
    const user = await this.userService.create(registerDto);
    if (!user) {
      throw new BadRequestException('Unable to register');
    }
    const { accessToken } = await this.authService.login(
      { email: user.email, password: registerDto.password },
      {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      },
    );
    this.setTokenCookie(res, accessToken);
    return { message: 'Registered successfully' };
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken } = await this.authService.login(loginDto, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });
    this.setTokenCookie(res, accessToken);
    return { message: 'Logged in successfully' };
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(
    @Req() req: PayloadRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(req.user.sessionId);
    res.clearCookie('token');
    return { message: 'Logged out successfully' };
  }

  @Get('check')
  @UseGuards(AuthGuard)
  check() {
    return { authenticated: true };
  }
}
