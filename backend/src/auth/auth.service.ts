import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@user/entities/user.entity';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { HashService } from '@common/common.module';
import { Session } from './entities/session.entity';

interface LoginMetadata {
  userAgent?: string;
  ipAddress?: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    private jwtService: JwtService,
    private hashService: HashService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto, metadata?: LoginMetadata) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email.toLowerCase() },
    });

    // Use same error message for both cases to prevent user enumeration
    const invalidCredentialsError = new UnauthorizedException('Invalid email or password');

    if (!user) {
      throw invalidCredentialsError;
    }

    const isPasswordValid = await this.hashService.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw invalidCredentialsError;
    }

    const expiresAt = new Date();
    const sessionDuration = this.configService.get<number>('SESSION_DURATION_HOURS', 3);
    expiresAt.setHours(expiresAt.getHours() + sessionDuration);

    const session = this.sessionRepository.create({
      user,
      userAgent: metadata?.userAgent,
      ipAddress: metadata?.ipAddress,
      expiresAt,
    });
    await this.sessionRepository.save(session);

    const payload = { email: user.email, id: user.id, sessionId: session.id };

    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }

  async validateSession(sessionId: string): Promise<Session | null> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, revoked: false },
      relations: ['user'],
    });

    if (!session) {
      return null;
    }

    if (new Date() > session.expiresAt) {
      await this.sessionRepository.update(sessionId, { revoked: true });
      return null;
    }

    return session;
  }

  async extendSession(sessionId: string): Promise<void> {
    const sessionDuration = this.configService.get<number>('SESSION_DURATION_HOURS', 3);
    const newExpiresAt = new Date();
    newExpiresAt.setHours(newExpiresAt.getHours() + sessionDuration);

    await this.sessionRepository.update(sessionId, {
      expiresAt: newExpiresAt,
      lastActivityAt: new Date(),
    });
  }

  async logout(sessionId: string): Promise<void> {
    await this.sessionRepository.update(sessionId, { revoked: true });
  }
}
