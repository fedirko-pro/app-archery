import { Module, forwardRef } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserAchievement } from '../user/entity/user-achievement.entity';
import { User } from '../user/entity/user.entity';
import { AchievementsService } from '../user/achievements.service';
import {
  AchievementsController,
  AdminAchievementsController,
} from '../user/achievements.controller';
import { UserService } from '../user/user.service';
import { ProfileVisibilityService } from '../user/profile-visibility.service';
import { TrainingModule } from '../training/training.module';
import { EquipmentModule } from '../equipment/equipment.module';
import { RolePermissionsModule } from '../auth/role-permissions.module';
import { EmailModule } from '../email/email.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([UserAchievement, User]),
    forwardRef(() => TrainingModule),
    EquipmentModule,
    RolePermissionsModule,
    EmailModule,
    UploadModule,
  ],
  providers: [AchievementsService, UserService, ProfileVisibilityService],
  controllers: [AchievementsController, AdminAchievementsController],
  exports: [AchievementsService],
})
export class AchievementsModule {}
