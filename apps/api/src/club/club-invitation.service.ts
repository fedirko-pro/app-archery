import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ClubInvitation, ClubInvitationStatus } from './club-invitation.entity';
import { ClubMembership, ClubMembershipStatus, ClubMembershipRole } from './club-membership.entity';
import { Club } from './club.entity';
import { User } from '../user/entity/user.entity';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'node:crypto';

@Injectable()
export class ClubInvitationService {
  private readonly logger = new Logger(ClubInvitationService.name);

  constructor(
    private readonly em: EntityManager,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async sendInvitation(
    clubId: string,
    email: string,
    invitedById: string,
  ): Promise<ClubInvitation> {
    const club = await this.em.findOne(Club, { id: clubId });
    if (!club) throw new NotFoundException('Club not found');

    const invitedBy = await this.em.findOne(User, { id: invitedById });
    if (!invitedBy) throw new NotFoundException('Inviter not found');

    // Check for existing pending invitation
    const existing = await this.em.findOne(ClubInvitation, {
      club: { id: clubId },
      email,
      status: ClubInvitationStatus.PENDING,
    });
    if (existing) {
      throw new ConflictException('A pending invitation already exists for this email');
    }

    const token = randomBytes(32).toString('hex');

    const invitation = new ClubInvitation();
    invitation.club = club;
    invitation.email = email;
    invitation.invitedBy = invitedBy;
    invitation.token = token;
    invitation.status = ClubInvitationStatus.PENDING;

    await this.em.persistAndFlush(invitation);

    // Send email
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    this.emailService
      .sendClubInvitationEmail(
        email,
        club.name,
        invitedBy.firstName || invitedBy.email,
        `${frontendUrl}/accept-club-invitation/${token}`,
        // We don't know the recipient's language, default to en
        'en',
      )
      .catch((err) => {
        this.logger.error(`Failed to send club invitation email: ${err.message}`);
      });

    return invitation;
  }

  async acceptInvitation(token: string): Promise<ClubMembership> {
    const invitation = await this.em.findOne(ClubInvitation, { token });
    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== ClubInvitationStatus.PENDING) {
      throw new ConflictException('Invitation is no longer pending');
    }

    // Find or create user by email
    let user = await this.em.findOne(User, { email: invitation.email });

    invitation.status = ClubInvitationStatus.ACCEPTED;

    if (!user) {
      // User doesn't exist yet - they need to sign up first
      // Mark invitation as accepted but user needs to register
      await this.em.flush();
      return null as any; // Frontend will redirect to signup
    }

    // Create membership
    const membership = new ClubMembership();
    membership.user = user;
    membership.club = invitation.club;
    membership.isCustom = false;
    membership.status = ClubMembershipStatus.APPROVED;
    membership.invitedBy = invitation.invitedBy;

    await this.em.persistAndFlush(membership);

    // Notify club admin
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    this.emailService
      .sendClubJoinedEmail(
        invitation.invitedBy.email,
        invitation.invitedBy.firstName || invitation.invitedBy.email,
        invitation.club.name,
        user.firstName || user.email,
        `${frontendUrl}/my-club`,
        invitation.invitedBy.appLanguage,
      )
      .catch((err) => {
        this.logger.error(`Failed to send club joined email: ${err.message}`);
      });

    return membership;
  }

  async getPendingInvitations(clubId: string): Promise<ClubInvitation[]> {
    return this.em.find(
      ClubInvitation,
      { club: { id: clubId }, status: ClubInvitationStatus.PENDING },
      { populate: ['invitedBy'], orderBy: { createdAt: 'DESC' } },
    );
  }
}
