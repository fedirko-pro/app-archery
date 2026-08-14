import { EntityManager } from '@mikro-orm/core';
import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  AnnouncementDto,
  AnnouncementsListDto,
  AudienceCountDto,
  SendAnnouncementRequest,
} from '@sokil/shared-types';
import {
  ClubMembership,
  ClubMembershipRole,
  ClubMembershipStatus,
} from '../club/club-membership.entity';
import {
  FederationMembership,
  FederationMembershipStatus,
} from '../federation/federation-membership.entity';
import { Tournament } from '../tournament/tournament.entity';
import {
  ApplicationStatus,
  TournamentApplication,
} from '../tournament/tournament-application.entity';
import { User } from '../user/entity/user.entity';
import { Roles } from '../user/types';
import { NotificationBroadcast } from './announcement.entity';
import { NotificationsService } from './notifications.service';

export interface SendAnnouncementInput {
  title?: string;
  message: string;
  link?: string;
}

@Injectable()
export class AnnouncementsService {
  private readonly logger = new Logger(AnnouncementsService.name);

  constructor(
    private readonly em: EntityManager,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getAudienceCount(viewerId: string, role: string): Promise<AudienceCountDto> {
    const userIds = await this.resolveScopeUserIds(viewerId, role);
    return { count: userIds.length };
  }

  async listForSender(
    senderId: string,
    options: { limit?: number; offset?: number } = {},
  ): Promise<AnnouncementsListDto> {
    const limit = Math.min(Math.max(options.limit ?? 50, 1), 100);
    const offset = Math.max(options.offset ?? 0, 0);

    const [rows, total] = await this.em.findAndCount(
      NotificationBroadcast,
      { sender: { id: senderId } },
      {
        orderBy: { createdAt: 'DESC' },
        limit,
        offset,
      },
    );

    return {
      items: rows.map((row) => this.toDto(row)),
      total,
    };
  }

  async send(
    viewerId: string,
    role: string,
    senderName: string,
    input: SendAnnouncementRequest,
  ): Promise<AnnouncementDto> {
    if (!input.message?.trim()) {
      throw new NotFoundException('Message is required');
    }

    let recipientIds: string[];

    if (input.mode === 'all') {
      recipientIds = await this.resolveScopeUserIds(viewerId, role);
    } else if (input.mode === 'users') {
      const scopeSet = new Set(await this.resolveScopeUserIds(viewerId, role));
      const requested = input.userIds ?? [];
      const invalid = requested.filter((id) => !scopeSet.has(id));
      if (invalid.length > 0) {
        throw new ForbiddenException('One or more recipients are outside your scope');
      }
      recipientIds = requested;
    } else {
      throw new NotFoundException('Invalid audience mode');
    }

    return this.persistBroadcast({
      senderId: viewerId,
      senderName,
      audienceType: input.mode,
      title: input.title,
      message: input.message,
      link: input.link,
      recipientIds,
    });
  }

  async findTournament(tournamentId: string): Promise<Tournament> {
    const tournament = await this.em.findOne(
      Tournament,
      { id: tournamentId },
      { populate: ['createdBy'] },
    );
    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }
    return tournament;
  }

  async sendTournament(
    tournament: Tournament,
    viewerId: string,
    senderName: string,
    input: SendAnnouncementInput,
  ): Promise<AnnouncementDto> {
    if (!input.message?.trim()) {
      throw new NotFoundException('Message is required');
    }

    const applications = await this.em.find(
      TournamentApplication,
      { tournament: { id: tournament.id }, status: ApplicationStatus.APPROVED },
      { fields: ['applicant'] },
    );

    const recipientIds = [...new Set(applications.map((a) => a.applicant.id))].filter(Boolean);

    return this.persistBroadcast({
      senderId: viewerId,
      senderName,
      audienceType: 'tournament',
      title: input.title,
      message: input.message,
      link: input.link,
      recipientIds,
      tournamentId: tournament.id,
      tournamentTitle: tournament.title,
    });
  }

  private async persistBroadcast(data: {
    senderId: string;
    senderName: string;
    audienceType: string;
    title?: string;
    message: string;
    link?: string;
    recipientIds: string[];
    tournamentId?: string;
    tournamentTitle?: string;
  }): Promise<AnnouncementDto> {
    const broadcast = this.em.create(NotificationBroadcast, {
      sender: this.em.getReference(User, data.senderId),
      audienceType: data.audienceType,
      title: data.title?.trim() || undefined,
      message: data.message,
      link: data.link,
      tournamentId: data.tournamentId,
      tournamentTitle: data.tournamentTitle,
      recipientCount: data.recipientIds.length,
      createdAt: new Date(),
    });

    await this.em.persistAndFlush(broadcast);

    const sent = await this.notificationsService.createAnnouncementsForUsers(data.recipientIds, {
      title: data.title,
      message: data.message,
      senderName: data.senderName,
      link: data.link,
      broadcastId: broadcast.id,
    });

    if (sent !== data.recipientIds.length) {
      broadcast.recipientCount = sent;
      await this.em.flush();
    }

    this.logger.log(
      `Announcement ${broadcast.id} (${data.audienceType}) sent to ${broadcast.recipientCount} users`,
    );

    return this.toDto(broadcast);
  }

  private async resolveScopeUserIds(viewerId: string, role: string): Promise<string[]> {
    if (role === Roles.GeneralAdmin) {
      const users = await this.em.find(User, {}, { fields: ['id'] });
      return users.map((u) => u.id);
    }

    if (role === Roles.ClubAdmin) {
      const membership = await this.em.findOne(
        ClubMembership,
        {
          user: { id: viewerId },
          role: ClubMembershipRole.ADMIN,
          status: ClubMembershipStatus.APPROVED,
        },
        { populate: ['club'] },
      );
      const clubId = membership?.club?.id;
      if (!clubId) return [];
      const users = await this.em.find(User, { club: { id: clubId } }, { fields: ['id'] });
      return users.map((u) => u.id);
    }

    if (role === Roles.FederationAdmin) {
      const viewer = await this.em.findOne(
        User,
        { id: viewerId },
        { populate: ['managedFederation'] },
      );
      const federationId = viewer?.managedFederation?.id;
      if (!federationId) return [];
      const memberships = await this.em.find(
        FederationMembership,
        { federation: { id: federationId }, status: FederationMembershipStatus.APPROVED },
        { populate: ['club'] },
      );
      const clubIds = memberships.map((m) => m.club.id).filter((id): id is string => !!id);
      if (clubIds.length === 0) return [];
      const users = await this.em.find(
        User,
        { club: { id: { $in: clubIds } } },
        { fields: ['id'] },
      );
      return users.map((u) => u.id);
    }

    return [];
  }

  private toDto(row: NotificationBroadcast): AnnouncementDto {
    return {
      id: row.id,
      audienceType: row.audienceType as AnnouncementDto['audienceType'],
      title: row.title ?? null,
      message: row.message,
      link: row.link ?? null,
      recipientCount: row.recipientCount,
      tournamentId: row.tournamentId ?? null,
      tournamentTitle: row.tournamentTitle ?? null,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
