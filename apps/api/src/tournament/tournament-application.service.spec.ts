import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { TournamentApplicationService } from './tournament-application.service';
import { ApplicationStatus } from './tournament-application.entity';
import { EmailService } from '../email/email.service';
import { AchievementsService } from '../user/achievements.service';

describe('TournamentApplicationService', () => {
  let service: TournamentApplicationService;
  let em: jest.Mocked<EntityManager>;

  const mockTournament = {
    id: 'tournament-1',
    title: 'Test Tournament',
    allowMultipleApplications: true,
  };
  const mockUser = {
    id: 'user-1',
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
    appLanguage: 'en',
  };

  const mockEm = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    persistAndFlush: jest.fn(),
    removeAndFlush: jest.fn(),
    nativeDelete: jest.fn(),
    count: jest.fn(),
    assign: jest.fn(),
  } as unknown as jest.Mocked<EntityManager>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TournamentApplicationService,
        { provide: EntityManager, useValue: mockEm },
        {
          provide: EmailService,
          useValue: {
            sendApplicationStatusEmail: jest.fn().mockResolvedValue(undefined),
            sendApplicationConfirmationEmail: jest.fn().mockResolvedValue(undefined),
            sendApplicationSubmittedEmail: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: AchievementsService,
          useValue: {
            grant: jest.fn().mockResolvedValue(undefined),
            syncComputed: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<TournamentApplicationService>(TournamentApplicationService);
    em = module.get(EntityManager) as jest.Mocked<EntityManager>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an application', async () => {
      const mockCategory = { id: 'category-1', code: 'R' };
      const mockDivision = { id: 'division-1', name: 'Recurve' };

      // resolveBowCategoryId called first: looks up by { code: 'R' }
      em.findOne.mockResolvedValueOnce(mockCategory as any);
      // then tournament, applicant, existing apps, division
      em.findOne
        .mockResolvedValueOnce(mockTournament as any)
        .mockResolvedValueOnce(mockUser as any);
      em.find.mockResolvedValue([]);
      em.findOne
        .mockResolvedValueOnce(mockDivision as any) // division
        .mockResolvedValueOnce(mockCategory as any); // bow category by ID

      const mockApp = { id: 'app-1', tournament: mockTournament, applicant: mockUser };
      em.create.mockReturnValue(mockApp as any);

      const result = await service.create({
        tournamentId: 'tournament-1',
        applicantId: 'user-1',
        division: 'division-1',
        category: 'R',
      });

      expect(result).toEqual(mockApp);
      expect(em.persistAndFlush).toHaveBeenCalledWith(mockApp);
    });

    it('should throw NotFoundException for non-existent tournament', async () => {
      // resolveBowCategoryId: no category provided → returns undefined
      // no em.findOne calls needed before tournament lookup
      em.findOne.mockResolvedValue(null);

      await expect(
        service.create({ tournamentId: 'bad-id', applicantId: 'user-1' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException for duplicate application when not allowed', async () => {
      // resolveBowCategoryId: no category → returns undefined, no query
      // tournament lookup → returns tournament with allowMultipleApplications: false
      em.findOne.mockResolvedValueOnce({
        ...mockTournament,
        allowMultipleApplications: false,
      } as any);
      // applicant lookup → returns user
      em.findOne.mockResolvedValueOnce(mockUser as any);
      // existing applications → returns 1
      em.find.mockResolvedValue([{ id: 'existing-app' } as any]);

      await expect(
        service.create({ tournamentId: 'tournament-1', applicantId: 'user-1' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('withdraw', () => {
    it('should withdraw own application', async () => {
      const mockApp = {
        id: 'app-1',
        applicant: { id: 'user-1' },
        status: 'pending',
        tournament: mockTournament,
      };
      em.findOne.mockResolvedValue(mockApp as any);

      const result = await service.withdraw('app-1', 'user-1', 'Cannot attend');
      expect(result.status).toBe('withdrawn');
      expect(result.rejectionReason).toBe('Cannot attend');
      expect(em.persistAndFlush).toHaveBeenCalled();
    });

    it('should require a withdrawal reason', async () => {
      const mockApp = {
        id: 'app-1',
        applicant: { id: 'user-1' },
        status: 'pending',
        tournament: mockTournament,
      };
      em.findOne.mockResolvedValue(mockApp as any);

      await expect(service.withdraw('app-1', 'user-1', '  ')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for non-existent application', async () => {
      em.findOne.mockResolvedValue(null);

      await expect(service.withdraw('bad-id', 'user-1', 'reason')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateStatus', () => {
    it('should approve an application', async () => {
      const mockApp = {
        id: 'app-1',
        status: 'pending',
        applicant: mockUser,
        tournament: mockTournament,
      };
      em.findOne.mockResolvedValue(mockApp as any);

      const result = await service.updateStatus(
        'app-1',
        ApplicationStatus.APPROVED,
        undefined,
        'admin-1',
      );
      expect(result.status).toBe(ApplicationStatus.APPROVED);
      expect(em.persistAndFlush).toHaveBeenCalled();
    });

    it('should reject an application with reason', async () => {
      const mockApp = {
        id: 'app-1',
        status: 'pending',
        applicant: mockUser,
        tournament: mockTournament,
      };
      em.findOne.mockResolvedValue(mockApp as any);

      const result = await service.updateStatus(
        'app-1',
        ApplicationStatus.REJECTED,
        'Full',
        'admin-1',
      );
      expect(result.status).toBe(ApplicationStatus.REJECTED);
      expect(result.rejectionReason).toBe('Full');
    });

    it('should require a rejection reason', async () => {
      const mockApp = {
        id: 'app-1',
        status: 'pending',
        applicant: mockUser,
        tournament: mockTournament,
      };
      em.findOne.mockResolvedValue(mockApp as any);

      await expect(
        service.updateStatus('app-1', ApplicationStatus.REJECTED, '  ', 'admin-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
