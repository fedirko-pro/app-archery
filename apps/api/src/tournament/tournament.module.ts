import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { AchievementsModule } from '../achievements/achievements.module';
import { RolePermissionsModule } from '../auth/role-permissions.module';
import { EmailModule } from '../email/email.module';
import { NotificationsModule } from '../notification/notifications.module';
import { UploadModule } from '../upload/upload.module';
import { PatrolController } from './patrol.controller';
import { Patrol } from './patrol.entity';
import { PatrolService } from './patrol.service';
import { PatrolGenerationService } from './patrol-generation.service';
import { PatrolMember } from './patrol-member.entity';
import { PatrolPdfService } from './patrol-pdf.service';
import { TournamentController } from './tournament.controller';
import { Tournament } from './tournament.entity';
import { TournamentService } from './tournament.service';
import { TournamentApplicationController } from './tournament-application.controller';
import { TournamentApplication } from './tournament-application.entity';
import { TournamentApplicationService } from './tournament-application.service';
import { TournamentFeedbackController } from './tournament-feedback.controller';
import { TournamentFeedback } from './tournament-feedback.entity';
import { TournamentFeedbackService } from './tournament-feedback.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      Tournament,
      Patrol,
      PatrolMember,
      TournamentApplication,
      TournamentFeedback,
    ]),
    UploadModule,
    EmailModule,
    RolePermissionsModule,
    AchievementsModule,
    NotificationsModule,
  ],
  providers: [
    TournamentService,
    PatrolService,
    PatrolGenerationService,
    PatrolPdfService,
    TournamentApplicationService,
    TournamentFeedbackService,
  ],
  controllers: [
    TournamentController,
    PatrolController,
    TournamentApplicationController,
    TournamentFeedbackController,
  ],
  exports: [MikroOrmModule],
})
export class TournamentModule {}
