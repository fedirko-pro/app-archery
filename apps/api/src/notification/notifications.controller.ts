import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestUser } from '../auth/permissions';
import type { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async list(
    @Request() req: { user: RequestUser },
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.notificationsService.listForUser(req.user.sub, { limit, offset });
  }

  @Get('unread-count')
  async unreadCount(@Request() req: { user: RequestUser }) {
    return this.notificationsService.getUnreadImportantCount(req.user.sub);
  }

  @Patch('read-all')
  async markAllRead(@Request() req: { user: RequestUser }) {
    return this.notificationsService.markAllRead(req.user.sub);
  }

  @Patch(':id/read')
  async markRead(@Param('id') id: string, @Request() req: { user: RequestUser }) {
    return this.notificationsService.markRead(req.user.sub, id);
  }
}
