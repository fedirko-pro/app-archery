import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UploadAuthorizationService } from './upload-authorization.service';
import { ROLES } from '../user/types';
import type { RequestUser } from '../auth/permissions';

describe('UploadAuthorizationService', () => {
  const em = {
    findOne: jest.fn(),
  };
  const permissionsService = {
    canCreateTournament: jest.fn(),
    canUpdateTournament: jest.fn(),
  };

  let service: UploadAuthorizationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UploadAuthorizationService(em as never, permissionsService as never);
  });

  describe('assertCanUploadBanner', () => {
    const admin: RequestUser = {
      sub: 'admin-1',
      role: ROLES.GeneralAdmin,
    };

    it('rejects banner upload when tournament does not exist', async () => {
      em.findOne.mockResolvedValue(null);

      await expect(service.assertCanUploadBanner(admin, 'missing-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('checks update permission when tournament already exists', async () => {
      const tournament = { id: 't-1', createdBy: { id: 'admin-1' } };
      em.findOne.mockResolvedValue(tournament);
      permissionsService.canUpdateTournament.mockReturnValue(true);

      await expect(service.assertCanUploadBanner(admin, 't-1')).resolves.toBeUndefined();
      expect(permissionsService.canUpdateTournament).toHaveBeenCalledWith(admin, tournament);
    });

    it('rejects existing tournament banner when user cannot update', async () => {
      const tournament = { id: 't-1', createdBy: { id: 'other' } };
      em.findOne.mockResolvedValue(tournament);
      permissionsService.canUpdateTournament.mockReturnValue(false);

      await expect(service.assertCanUploadBanner(admin, 't-1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('assertCanManageTournamentAttachments', () => {
    it('throws NotFoundException when tournament is missing', async () => {
      em.findOne.mockResolvedValue(null);
      const user: RequestUser = {
        sub: 'u-1',
        role: ROLES.ClubAdmin,
      };

      await expect(service.assertCanManageTournamentAttachments(user, 'missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
