import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { FederationService } from './federation.service';
import { FederationMembershipService } from './federation-membership.service';
import { CreateFederationDto } from './dto/create-federation.dto';
import { UpdateFederationDto } from './dto/update-federation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRoles } from '../user/types';
import { RequestUser } from '../auth/permissions';

@Controller('federations')
export class FederationController {
  constructor(
    private readonly federationService: FederationService,
    private readonly membershipService: FederationMembershipService,
  ) {}

  @Get()
  findAll(
    @Query('country') country?: string,
    @Query('visibility') visibility?: string,
    @Query('search') search?: string,
  ) {
    return this.federationService.findAll({ country, visibility, search });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.federationService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin)
  create(@Body() dto: CreateFederationDto) {
    return this.federationService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin, UserRoles.FederationAdmin)
  update(@Param('id') id: string, @Body() dto: UpdateFederationDto) {
    return this.federationService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin)
  remove(@Param('id') id: string) {
    return this.federationService.remove(id);
  }

  @Get(':id/members')
  @UseGuards(JwtAuthGuard)
  findMembers(@Param('id') id: string) {
    return this.membershipService.findMemberships(id);
  }

  @Post(':id/invite-club')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.FederationAdmin, UserRoles.GeneralAdmin)
  inviteClub(
    @Param('id') id: string,
    @Body('clubId') clubId: string,
    @Request() req: { user: RequestUser },
  ) {
    return this.membershipService.inviteClub(id, clubId, req.user.sub);
  }

  @Post('accept-invitation/:id')
  acceptInvitation(@Param('id') id: string) {
    return this.membershipService.acceptInvitation(id);
  }

  @Delete('membership/:id')
  @UseGuards(JwtAuthGuard)
  async removeMembership(@Param('id') id: string, @Request() req: { user: RequestUser }) {
    const membership = await this.membershipService.findOne(id);
    const isSelfRemoval = membership.invitedBy?.id !== req.user.sub;
    return this.membershipService.removeMembership(id, req.user.sub, isSelfRemoval);
  }
}
