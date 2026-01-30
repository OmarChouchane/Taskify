import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { HashService } from '@common/common.module';

describe('UserService', () => {
  let service: UserService;
  let userRepository: any;
  let hashService: any;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'Test',
    lastName: 'User',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: HashService,
          useValue: {
            hash: jest.fn().mockResolvedValue('hashedPassword'),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(User));
    hashService = module.get(HashService);
  });

  describe('create', () => {
    it('should hash password and create user', async () => {
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);

      const result = await service.create({
        email: 'test@example.com',
        password: 'plainPassword',
        firstName: 'Test',
        lastName: 'User',
      });

      expect(hashService.hash).toHaveBeenCalledWith('plainPassword');
      expect(userRepository.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'hashedPassword',
        firstName: 'Test',
        lastName: 'User',
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      userRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      userRepository.findOneBy.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      userRepository.update.mockResolvedValue({ affected: 1 });

      await service.update(1, { firstName: 'Updated' });

      expect(userRepository.update).toHaveBeenCalledWith(1, {
        firstName: 'Updated',
        lastName: undefined,
      });
    });
  });

  describe('remove', () => {
    it('should delete user', async () => {
      userRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(1);

      expect(userRepository.delete).toHaveBeenCalledWith(1);
    });
  });
});
