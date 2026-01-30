import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '@user/entities/user.entity';
import { Session } from './entities/session.entity';
import { HashService } from '@common/common.module';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: any;
  let sessionRepository: any;
  let hashService: any;
  let jwtService: any;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'Test',
    lastName: 'User',
  };

  const mockSession = {
    id: 'session-uuid',
    user: mockUser,
    revoked: false,
    expiresAt: new Date(Date.now() + 3600000),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Session),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
          },
        },
        {
          provide: HashService,
          useValue: {
            compare: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(3),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    sessionRepository = module.get(getRepositoryToken(Session));
    hashService = module.get(HashService);
    jwtService = module.get(JwtService);
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'notfound@example.com', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      hashService.compare.mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return accessToken on successful login', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      hashService.compare.mockResolvedValue(true);
      sessionRepository.create.mockReturnValue(mockSession);
      sessionRepository.save.mockResolvedValue(mockSession);

      const result = await service.login({
        email: 'test@example.com',
        password: 'password',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result.accessToken).toBe('mock-jwt-token');
      expect(sessionRepository.create).toHaveBeenCalled();
      expect(sessionRepository.save).toHaveBeenCalled();
    });

    it('should create session with metadata', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      hashService.compare.mockResolvedValue(true);
      sessionRepository.create.mockReturnValue(mockSession);
      sessionRepository.save.mockResolvedValue(mockSession);

      await service.login(
        { email: 'test@example.com', password: 'password' },
        { userAgent: 'Mozilla/5.0', ipAddress: '127.0.0.1' },
      );

      expect(sessionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userAgent: 'Mozilla/5.0',
          ipAddress: '127.0.0.1',
        }),
      );
    });
  });

  describe('validateSession', () => {
    it('should return null if session not found', async () => {
      sessionRepository.findOne.mockResolvedValue(null);

      const result = await service.validateSession('invalid-session-id');

      expect(result).toBeNull();
    });

    it('should return null and revoke session if expired', async () => {
      const expiredSession = {
        ...mockSession,
        expiresAt: new Date(Date.now() - 3600000),
      };
      sessionRepository.findOne.mockResolvedValue(expiredSession);

      const result = await service.validateSession('session-uuid');

      expect(result).toBeNull();
      expect(sessionRepository.update).toHaveBeenCalledWith('session-uuid', { revoked: true });
    });

    it('should return session if valid', async () => {
      sessionRepository.findOne.mockResolvedValue(mockSession);

      const result = await service.validateSession('session-uuid');

      expect(result).toEqual(mockSession);
    });
  });

  describe('logout', () => {
    it('should revoke session', async () => {
      sessionRepository.update.mockResolvedValue({ affected: 1 });

      await service.logout('session-uuid');

      expect(sessionRepository.update).toHaveBeenCalledWith('session-uuid', {
        revoked: true,
      });
    });
  });

  describe('extendSession', () => {
    it('should extend session expiry and update lastActivityAt', async () => {
      sessionRepository.update.mockResolvedValue({ affected: 1 });

      await service.extendSession('session-uuid');

      expect(sessionRepository.update).toHaveBeenCalledWith(
        'session-uuid',
        expect.objectContaining({
          expiresAt: expect.any(Date),
          lastActivityAt: expect.any(Date),
        }),
      );
    });
  });
});