import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { RolePermissionsModule } from '../auth/role-permissions.module';
import { NotificationBroadcast } from './announcement.entity';
import { AnnouncementsController } from './announcements.controller';
import { AnnouncementsService } from './announcements.service';
import { Notification } from './notification.entity';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { PushService } from './push.service';
import { PushSubscription } from './push-subscription.entity';
import { StreakReminderService } from './streak-reminder.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([Notification, NotificationBroadcast, PushSubscription]),
    RolePermissionsModule,
  ],
  controllers: [NotificationsController, AnnouncementsController],
  providers: [NotificationsService, AnnouncementsService, PushService, StreakReminderService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
