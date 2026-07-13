import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { FederationMembership, FederationMembershipStatus } from './federation-membership.entity';
import { Federation } from './federation.entity';
import { Club } from '../club/club.entity';
import { User } from '../user/entity/user.entity';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import {
  ClubMembership,
  ClubMembershipRole,
  ClubMembershipStatus,
} from '../club/club-membership.entity';

@Injectable()
export class FederationMembershipService {
  private readonly logger = new Logger(FederationMembershipService.name);

  constructor(
    private readonly em: EntityManager,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async findMemberships(federationId: string): Promise<FederationMembership[]> {
    return this.em.find(
      FederationMembership,
      { federation: { id: federationId } },
      { populate: ['club', 'invitedBy'], orderBy: { createdAt: 'ASC' } },
    );
  }

  async findOne(id: string): Promise<FederationMembership> {
    const membership = await this.em.findOne(
      FederationMembership,
      { id },
      { populate: ['federation', 'club', 'invitedBy'] },
    );
    if (!membership) {
      throw new NotFoundException(`Federation membership with ID ${id} not found`);
    }
    return membership;
  }

  async inviteClub(
    federationId: string,
    clubId: string,
    invitedById: string,
  ): Promise<FederationMembership> {
    const federation = await this.em.findOne(Federation, { id: federationId });
    if (!federation) throw new NotFoundException('Federation not found');

    const club = await this.em.findOne(Club, { id: clubId });
    if (!club) throw new NotFoundException('Club not found');

    const invitedBy = await this.em.findOne(User, { id: invitedById });
    if (!invitedBy) throw new NotFoundException('Inviter not found');

    const existing = await this.em.findOne(FederationMembership, {
      federation: { id: federationId },
      club: { id: clubId },
    });
    if (existing) {
      throw new ConflictException('Club is already a member or has a pending invitation');
    }

    const membership = new FederationMembership();
    membership.federation = federation;
    membership.club = club;
    membership.invitedBy = invitedBy;
    membership.status = FederationMembershipStatus.PENDING;

    await this.em.persistAndFlush(membership);

    // Send email to club admins
    const clubAdminMemberships = await this.em.find(
      ClubMembership,
      {
        club: { id: clubId },
        role: ClubMembershipRole.ADMIN,
        status: ClubMembershipStatus.APPROVED,
      },
      { populate: ['user'] },
    );

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    for (const cm of clubAdminMemberships) {
      const admin = cm.user;
      this.emailService
        .sendFederationInvitationEmail(
          admin.email,
          admin.firstName || admin.email,
          club.name,
          federation.name,
          invitedBy.firstName || invitedBy.email,
          `${frontendUrl}/accept-federation-invitation/${membership.id}`,
          admin.appLanguage,
        )
        .catch((err) => {
          this.logger.error(`Failed to send federation invitation email: ${err.message}`);
        });
    }

    return membership;
  }

  async acceptInvitation(membershipId: string): Promise<FederationMembership> {
    const membership = await this.findOne(membershipId);
    if (membership.status !== FederationMembershipStatus.PENDING) {
      throw new ConflictException('Invitation is no longer pending');
    }

    membership.status = FederationMembershipStatus.APPROVED;
    await this.em.flush();

    // Notify federation admin who invited
    if (membership.invitedBy) {
      this.emailService
        .sendFederationClubJoinedEmail(
          membership.invitedBy.email,
          membership.invitedBy.firstName || membership.invitedBy.email,
          membership.federation.name,
          membership.club.name,
          membership.invitedBy.appLanguage,
        )
        .catch((err) => {
          this.logger.error(`Failed to send federation club joined email: ${err.message}`);
        });
    }

    return membership;
  }

  async removeMembership(
    membershipId: string,
    removedById: string,
    isSelfRemoval: boolean,
  ): Promise<void> {
    const membership = await this.findOne(membershipId);

    const federationName = membership.federation.name;
    const clubName = membership.club.name;

    await this.em.removeAndFlush(membership);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    if (isSelfRemoval) {
      // Club left: notify club admins + federation admin who invited
      const clubAdminMemberships = await this.em.find(
        ClubMembership,
        {
          club: { id: membership.club.id },
          role: ClubMembershipRole.ADMIN,
          status: ClubMembershipStatus.APPROVED,
        },
        { populate: ['user'] },
      );

      for (const cm of clubAdminMemberships) {
        const admin = cm.user;
        this.emailService
          .sendClubLeftFederationEmail(
            admin.email,
            admin.firstName || admin.email,
            clubName,
            federationName,
            `${frontendUrl}/profile`,
            admin.appLanguage,
          )
          .catch((err) => {
            this.logger.error(`Failed to send club left federation email: ${err.message}`);
          });
      }

      if (membership.invitedBy) {
        this.emailService
          .sendFederationClubRemovedEmail(
            membership.invitedBy.email,
            membership.invitedBy.firstName || membership.invitedBy.email,
            federationName,
            clubName,
            clubName,
            membership.invitedBy.appLanguage,
          )
          .catch((err) => {
            this.logger.error(`Failed to send federation club removed email: ${err.message}`);
          });
      }
    } else {
      // Fed admin removed club: notify club admins + acting admin
      const clubAdminMemberships = await this.em.find(
        ClubMembership,
        {
          club: { id: membership.club.id },
          role: ClubMembershipRole.ADMIN,
          status: ClubMembershipStatus.APPROVED,
        },
        { populate: ['user'] },
      );

      for (const cm of clubAdminMemberships) {
        const admin = cm.user;
        this.emailService
          .sendClubRemovedFromFederationEmail(
            admin.email,
            admin.firstName || admin.email,
            federationName,
            clubName,
            admin.appLanguage,
          )
          .catch((err) => {
            this.logger.error(`Failed to send club removed from federation email: ${err.message}`);
          });
      }

      const admin = await this.em.findOne(User, { id: removedById });
      if (admin) {
        this.emailService
          .sendFederationClubRemovedEmail(
            admin.email,
            admin.firstName || admin.email,
            federationName,
            clubName,
            clubName,
            admin.appLanguage,
          )
          .catch((err) => {
            this.logger.error(`Failed to send confirmation to fed admin: ${err.message}`);
          });
      }
    }
  }

  async isFederationAdmin(userId: string, federationId: string): Promise<boolean> {
    const membership = await this.em.findOne(FederationMembership, {
      federation: { id: federationId },
      invitedBy: { id: userId },
      status: FederationMembershipStatus.APPROVED,
    });
    return !!membership;
  }

  async getAdminFederation(userId: string): Promise<Federation | null> {
    const membership = await this.em.findOne(
      FederationMembership,
      {
        invitedBy: { id: userId },
        status: FederationMembershipStatus.APPROVED,
      },
      { populate: ['federation'] },
    );
    return membership?.federation ?? null;
  }

  async findClubMembership(
    federationId: string,
    clubId: string,
  ): Promise<FederationMembership | null> {
    return this.em.findOne(FederationMembership, {
      federation: { id: federationId },
      club: { id: clubId },
    });
  }
}
