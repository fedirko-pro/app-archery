import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { EntityManager, FilterQuery } from '@mikro-orm/core';
import { ClubMembership, ClubMembershipStatus, ClubMembershipRole } from './club-membership.entity';
import { Club } from './club.entity';
import { User } from '../user/entity/user.entity';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ClubMembershipService {
  private readonly logger = new Logger(ClubMembershipService.name);

  constructor(
    private readonly em: EntityManager,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async findMemberships(clubId: string): Promise<ClubMembership[]> {
    return this.em.find(
      ClubMembership,
      { club: { id: clubId } },
      { populate: ['user', 'invitedBy'], orderBy: { createdAt: 'ASC' } },
    );
  }

  async findUserMemberships(userId: string): Promise<ClubMembership[]> {
    return this.em.find(
      ClubMembership,
      { user: { id: userId } },
      { populate: ['club', 'invitedBy'], orderBy: { createdAt: 'ASC' } },
    );
  }

  async findOne(id: string): Promise<ClubMembership> {
    const membership = await this.em.findOne(
      ClubMembership,
      { id },
      { populate: ['club', 'user', 'invitedBy'] },
    );
    if (!membership) {
      throw new NotFoundException(`Club membership with ID ${id} not found`);
    }
    return membership;
  }

  async joinAsCustom(userId: string, clubName: string): Promise<ClubMembership> {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) throw new NotFoundException('User not found');

    const existing = await this.em.findOne(ClubMembership, {
      user: { id: userId },
      isCustom: true,
      customName: clubName,
    });
    if (existing) {
      throw new ConflictException('You already have this custom club entry');
    }

    const membership = new ClubMembership();
    membership.user = user;
    membership.club = null as any; // custom entries don't reference a real club
    membership.isCustom = true;
    membership.customName = clubName;
    membership.status = ClubMembershipStatus.APPROVED;

    await this.em.persistAndFlush(membership);
    return membership;
  }

  async requestMembership(userId: string, clubId: string): Promise<ClubMembership> {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) throw new NotFoundException('User not found');

    const club = await this.em.findOne(Club, { id: clubId });
    if (!club) throw new NotFoundException('Club not found');

    const existing = await this.em.findOne(ClubMembership, {
      user: { id: userId },
      club: { id: clubId },
      isCustom: false,
    });
    if (existing) {
      throw new ConflictException('You already have a membership request for this club');
    }

    const membership = new ClubMembership();
    membership.user = user;
    membership.club = club;
    membership.isCustom = false;
    membership.status = ClubMembershipStatus.PENDING;

    await this.em.persistAndFlush(membership);
    return membership;
  }

  async approveMembership(membershipId: string, adminId: string): Promise<ClubMembership> {
    const membership = await this.findOne(membershipId);
    if (membership.status === ClubMembershipStatus.APPROVED) {
      throw new ConflictException('Membership is already approved');
    }

    membership.status = ClubMembershipStatus.APPROVED;
    await this.em.flush();

    // Notify user
    const admin = await this.em.findOne(User, { id: adminId });
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    this.emailService
      .sendClubJoinedEmail(
        membership.user.email,
        membership.user.firstName || membership.user.email,
        membership.club.name,
        admin?.firstName || admin?.email || 'Club Admin',
        `${frontendUrl}/profile`,
        membership.user.appLanguage,
      )
      .catch((err) => {
        this.logger.error(`Failed to send club joined email: ${err.message}`);
      });

    return membership;
  }

  async removeMembership(
    membershipId: string,
    removedById: string,
    isSelfRemoval: boolean,
  ): Promise<void> {
    const membership = await this.findOne(membershipId);

    const clubName = membership.club.name;
    const userName = membership.user.firstName || membership.user.email;
    const userEmail = membership.user.email;

    // Find club admin email for notification
    const clubAdmins = await this.em.find(ClubMembership, {
      club: { id: membership.club.id },
      role: ClubMembershipRole.ADMIN,
      status: ClubMembershipStatus.APPROVED,
    });

    await this.em.removeAndFlush(membership);

    // Send notifications
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    if (isSelfRemoval) {
      // User left: notify user + club admins
      this.emailService
        .sendClubLeftEmail(
          userEmail,
          userName,
          clubName,
          `${frontendUrl}/profile`,
          membership.user.appLanguage,
        )
        .catch((err) => {
          this.logger.error(`Failed to send club left email to user: ${err.message}`);
        });

      for (const admin of clubAdmins) {
        this.emailService
          .sendClubMemberRemovedEmail(
            admin.user.email,
            admin.user.firstName || admin.user.email,
            clubName,
            userName,
            admin.user.appLanguage,
          )
          .catch((err) => {
            this.logger.error(`Failed to send club member removed email: ${err.message}`);
          });
      }
    } else {
      // Admin removed user: notify user + acting admin
      this.emailService
        .sendClubMemberRemovedEmail(
          userEmail,
          userName,
          clubName,
          userName,
          membership.user.appLanguage,
        )
        .catch((err) => {
          this.logger.error(`Failed to send club removed email to user: ${err.message}`);
        });

      const admin = await this.em.findOne(User, { id: removedById });
      if (admin) {
        this.emailService
          .sendClubMemberRemovedEmail(
            admin.email,
            admin.firstName || admin.email,
            clubName,
            userName,
            admin.appLanguage,
          )
          .catch((err) => {
            this.logger.error(`Failed to send confirmation to admin: ${err.message}`);
          });
      }
    }
  }

  async isClubAdmin(userId: string, clubId: string): Promise<boolean> {
    const membership = await this.em.findOne(ClubMembership, {
      user: { id: userId },
      club: { id: clubId },
      role: ClubMembershipRole.ADMIN,
      status: ClubMembershipStatus.APPROVED,
    });
    return !!membership;
  }

  async getAdminClub(userId: string): Promise<Club | null> {
    const membership = await this.em.findOne(
      ClubMembership,
      {
        user: { id: userId },
        role: ClubMembershipRole.ADMIN,
        status: ClubMembershipStatus.APPROVED,
      },
      { populate: ['club'] },
    );
    return membership?.club ?? null;
  }
}
