import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ClubService } from './club.service';
import { ClubController } from './club.controller';
import { Club } from './club.entity';
import { ClubMembership } from './club-membership.entity';
import { ClubInvitation } from './club-invitation.entity';
import { ClubJoinRequest } from './club-join-request.entity';
import { ClubMembershipService } from './club-membership.service';
import { ClubMembershipController } from './club-membership.controller';
import { ClubInvitationService } from './club-invitation.service';
import { ClubJoinRequestService } from './club-join-request.service';
import { ClubJoinRequestController } from './club-join-request.controller';
import { UploadModule } from '../upload/upload.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([Club, ClubMembership, ClubInvitation, ClubJoinRequest]),
    UploadModule,
    EmailModule,
  ],
  controllers: [ClubJoinRequestController, ClubMembershipController, ClubController],
  providers: [ClubService, ClubMembershipService, ClubInvitationService, ClubJoinRequestService],
  exports: [ClubService, ClubMembershipService],
})
export class ClubModule {}
