import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Patch,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestUser } from '../auth/permissions';
import { DeletePushSubscriptionDto, UpsertPushSubscriptionDto } from './dto/push-subscription.dto';
import { NotificationsService } from './notifications.service';
import { PushService } from './push.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly pushService: PushService,
  ) {}

  @Get('push/vapid-public-key')
  vapidPublicKey() {
    return { publicKey: this.pushService.getPublicKey() };
  }

  @Put('push/subscription')
  async upsertPushSubscription(
    @Request() req: { user: RequestUser },
    @Body() dto: UpsertPushSubscriptionDto,
    @Headers('user-agent') userAgent?: string,
  ) {
    await this.pushService.upsert(req.user.sub, dto, userAgent);
    return { ok: true };
  }

  @Delete('push/subscription')
  async deletePushSubscription(
    @Request() req: { user: RequestUser },
    @Body() dto: DeletePushSubscriptionDto,
  ) {
    await this.pushService.remove(req.user.sub, dto);
    return { ok: true };
  }

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
