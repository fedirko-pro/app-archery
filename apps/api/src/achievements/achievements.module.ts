import { MikroOrmModule } from '@mikro-orm/nestjs';
import { forwardRef, Module } from '@nestjs/common';
import { RolePermissionsModule } from '../auth/role-permissions.module';
import { ClubModule } from '../club/club.module';
import { EmailModule } from '../email/email.module';
import { EquipmentModule } from '../equipment/equipment.module';
import { NotificationsModule } from '../notification/notifications.module';
import { TrainingModule } from '../training/training.module';
import { UploadModule } from '../upload/upload.module';
import {
  AchievementsController,
  AdminAchievementsController,
} from '../user/achievements.controller';
import { AchievementsService } from '../user/achievements.service';
import { User } from '../user/entity/user.entity';
import { UserAchievement } from '../user/entity/user-achievement.entity';
import { ProfileVisibilityService } from '../user/profile-visibility.service';
import { UserService } from '../user/user.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([UserAchievement, User]),
    forwardRef(() => TrainingModule),
    EquipmentModule,
    RolePermissionsModule,
    EmailModule,
    UploadModule,
    ClubModule,
    NotificationsModule,
  ],
  providers: [AchievementsService, UserService, ProfileVisibilityService],
  controllers: [AchievementsController, AdminAchievementsController],
  exports: [AchievementsService],
})
export class AchievementsModule {}
