import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { EmailModule } from '../email/email.module';
import { NotificationsModule } from '../notification/notifications.module';
import { UploadModule } from '../upload/upload.module';
import { ClubController } from './club.controller';
import { Club } from './club.entity';
import { ClubService } from './club.service';
import { ClubInvitation } from './club-invitation.entity';
import { ClubInvitationService } from './club-invitation.service';
import { ClubJoinRequestController } from './club-join-request.controller';
import { ClubJoinRequest } from './club-join-request.entity';
import { ClubJoinRequestService } from './club-join-request.service';
import { ClubMembershipController } from './club-membership.controller';
import { ClubMembership } from './club-membership.entity';
import { ClubMembershipService } from './club-membership.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([Club, ClubMembership, ClubInvitation, ClubJoinRequest]),
    UploadModule,
    EmailModule,
    NotificationsModule,
  ],
  controllers: [ClubJoinRequestController, ClubMembershipController, ClubController],
  providers: [ClubService, ClubMembershipService, ClubInvitationService, ClubJoinRequestService],
  exports: [ClubService, ClubMembershipService],
})
export class ClubModule {}
