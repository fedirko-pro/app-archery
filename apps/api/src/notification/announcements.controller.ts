import {
  Body,
  Controller,
  DefaultValuePipe,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { SendAnnouncementRequest } from '@sokil/shared-types';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequestUser } from '../auth/permissions';
import { PermissionsService } from '../auth/permissions.service';
import { Roles as UserRoles } from '../user/types';
import { AnnouncementsService, SendAnnouncementInput } from './announcements.service';

interface ReqWithUser {
  user: RequestUser & { firstName?: string; lastName?: string; email: string };
}

const ADMIN_ROLES = [UserRoles.GeneralAdmin, UserRoles.ClubAdmin, UserRoles.FederationAdmin];

function resolveSenderName(user: ReqWithUser['user']): string {
  return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
}

@Controller('announcements')
@UseGuards(JwtAuthGuard)
export class AnnouncementsController {
  constructor(
    private readonly announcementsService: AnnouncementsService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @Get('audience-count')
  @UseGuards(RolesGuard)
  @Roles(...ADMIN_ROLES)
  async audienceCount(@Request() req: ReqWithUser) {
    return this.announcementsService.getAudienceCount(req.user.sub, req.user.role);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(...ADMIN_ROLES)
  async list(
    @Request() req: ReqWithUser,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.announcementsService.listForSender(req.user.sub, { limit, offset });
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(...ADMIN_ROLES)
  async send(@Request() req: ReqWithUser, @Body() body: SendAnnouncementRequest) {
    return this.announcementsService.send(
      req.user.sub,
      req.user.role,
      resolveSenderName(req.user),
      body,
    );
  }

  @Post('tournament/:tournamentId')
  async sendTournament(
    @Request() req: ReqWithUser,
    @Param('tournamentId') tournamentId: string,
    @Body() body: SendAnnouncementInput,
  ) {
    const tournament = await this.announcementsService.findTournament(tournamentId);
    if (!this.permissionsService.canViewTournamentApplications(req.user, tournament)) {
      throw new ForbiddenException();
    }
    return this.announcementsService.sendTournament(
      tournament,
      req.user.sub,
      resolveSenderName(req.user),
      body,
    );
  }
}
