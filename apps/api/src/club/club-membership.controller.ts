import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequestUser } from '../auth/permissions';
import { UserRoles } from '../user/types';
import { ClubInvitationService } from './club-invitation.service';
import { ClubMembershipService } from './club-membership.service';

@Controller('clubs')
export class ClubMembershipController {
  constructor(
    private readonly membershipService: ClubMembershipService,
    private readonly invitationService: ClubInvitationService,
  ) {}

  @Get('my-memberships')
  @UseGuards(JwtAuthGuard)
  findMyMemberships(@Request() req: { user: RequestUser }) {
    return this.membershipService.findUserMemberships(req.user.sub);
  }

  @Get('my-admin-club')
  @UseGuards(JwtAuthGuard)
  async findMyAdminClub(@Request() req: { user: RequestUser }) {
    return this.membershipService.getAdminClub(req.user.sub);
  }

  @Get(':id/members')
  @UseGuards(JwtAuthGuard)
  async findMembers(@Param('id') id: string, @Request() req: { user: RequestUser }) {
    await this.membershipService.assertCanManageClub(req.user.sub, id, req.user.role);
    return this.membershipService.findMemberships(id);
  }

  @Post(':id/join-custom')
  @UseGuards(JwtAuthGuard)
  joinAsCustom(
    @Param('id') id: string,
    @Body('clubName') clubName: string,
    @Request() req: { user: RequestUser },
  ) {
    return this.membershipService.joinAsCustom(req.user.sub, clubName);
  }

  @Post(':id/invite')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ClubAdmin, UserRoles.GeneralAdmin)
  async inviteMember(
    @Param('id') id: string,
    @Body('email') email: string,
    @Request() req: { user: RequestUser },
  ) {
    await this.membershipService.assertCanManageClub(req.user.sub, id, req.user.role);
    return this.invitationService.sendInvitation(id, email, req.user.sub);
  }

  @Post('accept-invitation/:token')
  acceptInvitation(@Param('token') token: string) {
    return this.invitationService.acceptInvitation(token);
  }

  @Patch('membership/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ClubAdmin, UserRoles.GeneralAdmin)
  approveMembership(@Param('id') id: string, @Request() req: { user: RequestUser }) {
    return this.membershipService.approveMembership(id, req.user.sub, req.user.role);
  }

  @Delete('membership/:id')
  @UseGuards(JwtAuthGuard)
  async removeMembership(@Param('id') id: string, @Request() req: { user: RequestUser }) {
    const membership = await this.membershipService.findOne(id);
    const isSelfRemoval = membership.user.id === req.user.sub;
    if (!isSelfRemoval) {
      await this.membershipService.assertCanManageClub(
        req.user.sub,
        membership.club.id,
        req.user.role,
      );
    }
    return this.membershipService.removeMembership(id, req.user.sub, isSelfRemoval);
  }
}
