import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'node:crypto';

import { EmailService } from '../email/email.service';
import { User } from '../user/entity/user.entity';
import { Club, ClubVisibility } from './club.entity';
import { ClubJoinRequest, ClubJoinRequestStatus } from './club-join-request.entity';
import { ClubMembership, ClubMembershipRole, ClubMembershipStatus } from './club-membership.entity';
import { ClubInvitation, ClubInvitationStatus } from './club-invitation.entity';
import { CreateClubJoinRequestDto } from './dto/create-club-join-request.dto';
import { ClubMembershipService } from './club-membership.service';

@Injectable()
export class ClubJoinRequestService {
  private readonly logger = new Logger(ClubJoinRequestService.name);

  constructor(
    private readonly em: EntityManager,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly membershipService: ClubMembershipService,
  ) {}

  async create(
    clubId: string,
    dto: CreateClubJoinRequestDto,
    userId?: string,
  ): Promise<ClubJoinRequest> {
    const club = await this.em.findOne(Club, { id: clubId });
    if (!club) {
      throw new NotFoundException('Club not found');
    }
    if (club.visibility !== ClubVisibility.PUBLIC) {
      throw new ForbiddenException('This club does not accept join requests');
    }

    const email = dto.email.trim().toLowerCase();
    let user: User | null = null;

    if (userId) {
      user = await this.em.findOne(User, { id: userId });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (user.email.toLowerCase() !== email) {
        throw new BadRequestException('Email must match your account email');
      }
    }

    const existingPending = await this.em.findOne(ClubJoinRequest, {
      club: { id: clubId },
      email,
      status: ClubJoinRequestStatus.PENDING,
    });
    if (existingPending) {
      throw new ConflictException('A pending join request already exists for this email');
    }

    if (user) {
      const existingMembership = await this.em.findOne(ClubMembership, {
        user: { id: user.id },
        club: { id: clubId },
        isCustom: false,
        status: { $in: [ClubMembershipStatus.PENDING, ClubMembershipStatus.APPROVED] },
      });
      if (existingMembership) {
        throw new ConflictException(
          'You already have a membership or pending request for this club',
        );
      }
    }

    const joinRequest = new ClubJoinRequest();
    joinRequest.club = club;
    joinRequest.name = dto.name.trim();
    joinRequest.email = email;
    joinRequest.message = dto.message?.trim() || undefined;
    joinRequest.user = user ?? undefined;
    joinRequest.status = ClubJoinRequestStatus.PENDING;

    await this.em.persistAndFlush(joinRequest);

    await this.notifyAdminsOfJoinRequest(joinRequest, club);

    return joinRequest;
  }

  async findForClub(clubId: string, userId: string, userRole: string): Promise<ClubJoinRequest[]> {
    await this.membershipService.assertCanManageClub(userId, clubId, userRole);

    return this.em.find(
      ClubJoinRequest,
      { club: { id: clubId } },
      {
        populate: ['user', 'reviewedBy'],
        orderBy: { createdAt: 'DESC' },
      },
    );
  }

  async findOne(id: string): Promise<ClubJoinRequest> {
    const joinRequest = await this.em.findOne(
      ClubJoinRequest,
      { id },
      { populate: ['club', 'user', 'reviewedBy'] },
    );
    if (!joinRequest) {
      throw new NotFoundException('Join request not found');
    }
    return joinRequest;
  }

  async approve(requestId: string, adminId: string, adminRole: string): Promise<ClubJoinRequest> {
    const joinRequest = await this.findOne(requestId);
    await this.membershipService.assertCanManageClub(adminId, joinRequest.club.id, adminRole);

    if (joinRequest.status !== ClubJoinRequestStatus.PENDING) {
      throw new ConflictException('Join request is no longer pending');
    }

    const admin = await this.em.findOne(User, { id: adminId });
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    const user = joinRequest.user ?? (await this.em.findOne(User, { email: joinRequest.email }));

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    if (user) {
      const existingMembership = await this.em.findOne(ClubMembership, {
        user: { id: user.id },
        club: { id: joinRequest.club.id },
        isCustom: false,
      });

      if (!existingMembership) {
        const membership = new ClubMembership();
        membership.user = user;
        membership.club = joinRequest.club;
        membership.isCustom = false;
        membership.status = ClubMembershipStatus.APPROVED;
        membership.role = ClubMembershipRole.MEMBER;
        membership.invitedBy = admin;
        await this.em.persist(membership);
      } else if (existingMembership.status !== ClubMembershipStatus.APPROVED) {
        existingMembership.status = ClubMembershipStatus.APPROVED;
      }

      this.emailService
        .sendClubJoinRequestApprovedEmail(
          user.email,
          user.firstName || joinRequest.name,
          joinRequest.club.name,
          `${frontendUrl}/profile`,
          user.appLanguage,
        )
        .catch((err) => {
          this.logger.error(`Failed to send join approved email: ${err.message}`);
        });
    } else {
      const token = randomBytes(32).toString('hex');
      joinRequest.invitationToken = token;

      const existingInvitation = await this.em.findOne(ClubInvitation, {
        club: { id: joinRequest.club.id },
        email: joinRequest.email,
        status: ClubInvitationStatus.PENDING,
      });

      if (!existingInvitation) {
        const invitation = new ClubInvitation();
        invitation.club = joinRequest.club;
        invitation.email = joinRequest.email;
        invitation.invitedBy = admin;
        invitation.token = token;
        invitation.status = ClubInvitationStatus.PENDING;
        await this.em.persist(invitation);
      } else {
        existingInvitation.token = token;
      }

      this.emailService
        .sendClubInvitationEmail(
          joinRequest.email,
          joinRequest.club.name,
          admin.firstName || admin.email,
          `${frontendUrl}/accept-club-invitation/${token}`,
          'en',
        )
        .catch((err) => {
          this.logger.error(`Failed to send club invitation email: ${err.message}`);
        });
    }

    joinRequest.status = ClubJoinRequestStatus.APPROVED;
    joinRequest.reviewedBy = admin;
    await this.em.flush();

    return joinRequest;
  }

  async reject(requestId: string, adminId: string, adminRole: string): Promise<ClubJoinRequest> {
    const joinRequest = await this.findOne(requestId);
    await this.membershipService.assertCanManageClub(adminId, joinRequest.club.id, adminRole);

    if (joinRequest.status !== ClubJoinRequestStatus.PENDING) {
      throw new ConflictException('Join request is no longer pending');
    }

    const admin = await this.em.findOne(User, { id: adminId });
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    joinRequest.status = ClubJoinRequestStatus.REJECTED;
    joinRequest.reviewedBy = admin;
    await this.em.flush();

    this.emailService
      .sendClubJoinRequestRejectedEmail(
        joinRequest.email,
        joinRequest.name,
        joinRequest.club.name,
        joinRequest.user?.appLanguage,
      )
      .catch((err) => {
        this.logger.error(`Failed to send join rejected email: ${err.message}`);
      });

    return joinRequest;
  }

  private async notifyAdminsOfJoinRequest(joinRequest: ClubJoinRequest, club: Club): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const reviewUrl = `${frontendUrl}/my-club`;

    const recipients = new Set<string>();
    if (club.contactEmail) {
      recipients.add(club.contactEmail);
    }

    const adminEmails = await this.membershipService.getClubAdminEmails(club.id);
    for (const email of adminEmails) {
      recipients.add(email);
    }

    if (recipients.size === 0) {
      this.logger.warn(`No recipients for join request notification for club ${club.id}`);
      return;
    }

    for (const email of recipients) {
      this.emailService
        .sendClubJoinRequestNotificationEmail(
          email,
          club.name,
          joinRequest.name,
          joinRequest.email,
          joinRequest.message,
          reviewUrl,
        )
        .catch((err) => {
          this.logger.error(`Failed to send join request notification: ${err.message}`);
        });
    }
  }
}
