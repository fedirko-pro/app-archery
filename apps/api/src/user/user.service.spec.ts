import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UserService } from './user.service';
import { EmailService } from '../email/email.service';
import { UploadService } from '../upload/upload.service';

jest.mock('bcryptjs');

describe('UserService', () => {
  let userService: UserService;
  let em: jest.Mocked<EntityManager>;
  let emailService: jest.Mocked<EmailService>;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'user',
    password: 'hashed-password',
    authProvider: 'local',
    appLanguage: 'en',
    profileVisibility: 'personal',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    club: { id: 'club-1', name: 'Test Club' },
    division: undefined,
    picture: undefined,
    resetPasswordToken: undefined,
    resetPasswordExpires: undefined,
    federationNumber: undefined,
    bio: undefined,
    categories: [],
  };

  const mockEm = {
    create: jest.fn(),
    persistAndFlush: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    fork: jest.fn(),
    getConnection: jest.fn(),
    removeAndFlush: jest.fn(),
    map: jest.fn(),
    nativeDelete: jest.fn(),
    count: jest.fn(),
    assign: jest.fn(),
  } as unknown as jest.Mocked<EntityManager>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: EntityManager, useValue: mockEm },
        {
          provide: UploadService,
          useValue: { cleanupUserFiles: jest.fn() },
        },
        {
          provide: EmailService,
          useValue: {
            sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
            sendRoleChangedEmail: jest.fn().mockResolvedValue(undefined),
            sendInvitationEmail: jest.fn().mockResolvedValue(undefined),
            sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('http://localhost:3000') },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    em = module.get(EntityManager) as jest.Mocked<EntityManager>;
    emailService = module.get(EmailService) as jest.Mocked<EmailService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      em.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      em.create.mockReturnValue(mockUser as any);

      const result = await userService.create({
        email: 'new@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Doe',
        authProvider: 'local',
      });

      expect(result).toEqual(mockUser);
      expect(em.create).toHaveBeenCalled();
      expect(em.persistAndFlush).toHaveBeenCalledWith(mockUser);
    });

    it('should throw ConflictException for duplicate email', async () => {
      em.findOne.mockResolvedValue(mockUser as any);

      await expect(
        userService.create({
          email: 'test@example.com',
          password: 'password123',
          firstName: '',
          lastName: '',
          authProvider: 'local',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException for short password', async () => {
      em.findOne.mockResolvedValue(null);

      await expect(
        userService.create({
          email: 'new@example.com',
          password: '12345',
          firstName: '',
          lastName: '',
          authProvider: 'local',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      em.findOne.mockResolvedValue(mockUser as any);

      const result = await userService.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);
    });

    it('should return null for non-existent email', async () => {
      em.findOne.mockResolvedValue(null);

      const result = await userService.findByEmail('nobody@example.com');
      expect(result).toBeNull();
    });

    it('should fetch with password when includePassword is true', async () => {
      const connection = { execute: jest.fn().mockResolvedValue({ id: 'user-1' }) };
      em.getConnection.mockReturnValue(connection as any);
      em.map.mockReturnValue(mockUser as any);

      const result = await userService.findByEmail('test@example.com', true);
      expect(connection.execute).toHaveBeenCalledWith(
        'SELECT * FROM "user" WHERE email = ?',
        ['test@example.com'],
        'get',
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      em.findOne.mockResolvedValue(mockUser as any);

      const result = await userService.findById('user-1');
      expect(result).toEqual(mockUser);
      expect(em.findOne).toHaveBeenCalledWith(
        expect.any(Function),
        { id: 'user-1' },
        { populate: ['club', 'division'] },
      );
    });
  });

  describe('changePassword', () => {
    const passwordData = {
      currentPassword: 'old-password',
      newPassword: 'new-password-1234',
      confirmPassword: 'new-password-1234',
    };

    it('should change password successfully', async () => {
      em.findOne.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(true)  // currentPassword match
        .mockResolvedValueOnce(false); // newPassword !== currentPassword
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-password');

      const result = await userService.changePassword('user-1', passwordData);
      expect(result).toEqual({ message: 'Password changed successfully' });
    });

    it('should throw NotFoundException for non-existent user', async () => {
      em.findOne.mockResolvedValue(null);

      await expect(userService.changePassword('bad-id', passwordData)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw UnauthorizedException for incorrect current password', async () => {
      em.findOne.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(userService.changePassword('user-1', passwordData)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getAllUsers', () => {
    it('should return all users with club info', async () => {
      const forkEm = {
        find: jest.fn().mockResolvedValue([mockUser]),
      };
      em.fork.mockReturnValue(forkEm as any);

      // First call to forkEm.find returns users, second returns clubs
      forkEm.find
        .mockResolvedValueOnce([mockUser])
        .mockResolvedValueOnce([{ id: 'club-1', name: 'Test Club' }]);

      const result = await userService.getAllUsers();
      expect(result).toHaveLength(1);
      expect(result[0].email).toBe('test@example.com');
      expect(result[0].club).toEqual({ id: 'club-1', name: 'Test Club' });
    });
  });
});
