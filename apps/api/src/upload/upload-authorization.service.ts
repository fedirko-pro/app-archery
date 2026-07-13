import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { PermissionsService } from '../auth/permissions.service';
import type { RequestUser } from '../auth/permissions';
import { Tournament } from '../tournament/tournament.entity';
import {
  ClubMembership,
  ClubMembershipRole,
  ClubMembershipStatus,
} from '../club/club-membership.entity';
import { ROLES } from '../user/types';

@Injectable()
export class UploadAuthorizationService {
  constructor(
    private readonly em: EntityManager,
    private readonly permissionsService: PermissionsService,
  ) {}

  assertCanUploadAvatar(user: RequestUser, entityId?: string): string {
    const targetId = entityId ?? user.sub;
    if (targetId !== user.sub) {
      throw new ForbiddenException('You can only upload your own avatar');
    }
    return targetId;
  }

  async assertCanUploadBanner(user: RequestUser, entityId: string): Promise<void> {
    const tournament = await this.em.findOne(
      Tournament,
      { id: entityId },
      { populate: ['createdBy'] },
    );
    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }
    if (!this.permissionsService.canUpdateTournament(user, tournament)) {
      throw new ForbiddenException('You cannot upload a banner for this tournament');
    }
  }

  async assertCanUploadLogo(user: RequestUser, entityId: string): Promise<void> {
    if (user.role === ROLES.GeneralAdmin) {
      return;
    }

    const membership = await this.em.findOne(ClubMembership, {
      user: { id: user.sub },
      club: { id: entityId },
      role: ClubMembershipRole.ADMIN,
      status: ClubMembershipStatus.APPROVED,
    });

    if (!membership) {
      throw new ForbiddenException('You can only upload a logo for clubs you manage');
    }
  }

  async assertCanManageTournamentAttachments(
    user: RequestUser,
    tournamentId: string,
  ): Promise<void> {
    const tournament = await this.em.findOne(
      Tournament,
      { id: tournamentId },
      { populate: ['createdBy'] },
    );
    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }
    if (!this.permissionsService.canUpdateTournament(user, tournament)) {
      throw new ForbiddenException('You cannot manage attachments for this tournament');
    }
  }
}
