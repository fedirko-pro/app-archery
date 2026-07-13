import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from './entity/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PublicProfileController } from './public-profile.controller';
import { PublicProfileService } from './public-profile.service';
import { ProfileVisibilityService } from './profile-visibility.service';
import { UploadModule } from '../upload/upload.module';
import { RolePermissionsModule } from '../auth/role-permissions.module';
import { EmailModule } from '../email/email.module';
import { TrainingModule } from '../training/training.module';
import { AchievementsModule } from '../achievements/achievements.module';
import { ClubModule } from '../club/club.module';
import { FederationMembership } from '../federation/federation-membership.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([User, FederationMembership]),
    UploadModule,
    RolePermissionsModule,
    EmailModule,
    TrainingModule,
    AchievementsModule,
    ClubModule,
  ],
  providers: [UserService, PublicProfileService, ProfileVisibilityService],
  controllers: [UserController, PublicProfileController],
  exports: [UserService],
})
export class UserModule {}
