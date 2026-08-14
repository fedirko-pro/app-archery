import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { RolePermissionsModule } from '../auth/role-permissions.module';
import { NotificationBroadcast } from './announcement.entity';
import { AnnouncementsController } from './announcements.controller';
import { AnnouncementsService } from './announcements.service';
import { Notification } from './notification.entity';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([Notification, NotificationBroadcast]),
    RolePermissionsModule,
  ],
  controllers: [NotificationsController, AnnouncementsController],
  providers: [NotificationsService, AnnouncementsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
