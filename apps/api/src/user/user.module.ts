import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { AchievementsModule } from '../achievements/achievements.module';
import { RolePermissionsModule } from '../auth/role-permissions.module';
import { ClubModule } from '../club/club.module';
import { EmailModule } from '../email/email.module';
import { FederationMembership } from '../federation/federation-membership.entity';
import { NotificationsModule } from '../notification/notifications.module';
import { TrainingModule } from '../training/training.module';
import { UploadModule } from '../upload/upload.module';
import { User } from './entity/user.entity';
import { ProfileVisibilityService } from './profile-visibility.service';
import { PublicProfileController } from './public-profile.controller';
import { PublicProfileService } from './public-profile.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([User, FederationMembership]),
    UploadModule,
    RolePermissionsModule,
    EmailModule,
    TrainingModule,
    AchievementsModule,
    ClubModule,
    NotificationsModule,
  ],
  providers: [UserService, PublicProfileService, ProfileVisibilityService],
  controllers: [UserController, PublicProfileController],
  exports: [UserService],
})
export class UserModule {}
