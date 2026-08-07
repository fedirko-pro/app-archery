import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Roles as RolesDecorator } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequestUser } from '../auth/permissions';
import { PermissionsService } from '../auth/permissions.service';
import { ClubMembershipService } from '../club/club-membership.service';
import { UserRoles } from '../user/types';
import { UserService } from '../user/user.service';
import { CreateFederationDto } from './dto/create-federation.dto';
import { UpdateFederationDto } from './dto/update-federation.dto';
import { FederationService } from './federation.service';
import { FederationMembershipStatus } from './federation-membership.entity';
import { FederationMembershipService } from './federation-membership.service';

@Controller('federations')
export class FederationController {
  constructor(
    private readonly federationService: FederationService,
    private readonly membershipService: FederationMembershipService,
    private readonly permissionsService: PermissionsService,
    private readonly clubMembershipService: ClubMembershipService,
    private readonly userService: UserService,
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
  @RolesDecorator(UserRoles.GeneralAdmin)
  create(@Body() dto: CreateFederationDto) {
    return this.federationService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(UserRoles.GeneralAdmin, UserRoles.FederationAdmin)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateFederationDto,
    @Request() req: { user: RequestUser },
  ) {
    const viewer = await this.userService.findById(req.user.sub);
    if (!this.permissionsService.canManageFederation(req.user, id, viewer?.managedFederation?.id)) {
      throw new ForbiddenException();
    }
    return this.federationService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(UserRoles.GeneralAdmin)
  remove(@Param('id') id: string) {
    return this.federationService.remove(id);
  }

  @Get(':id/members')
  @UseGuards(JwtAuthGuard)
  async findMembers(@Param('id') id: string, @Request() req: { user: RequestUser }) {
    await this.assertCanViewFederationMembers(req.user, id);
    return this.membershipService.findMemberships(id);
  }

  @Post(':id/invite-club')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RolesDecorator(UserRoles.FederationAdmin, UserRoles.GeneralAdmin)
  inviteClub(
    @Param('id') id: string,
    @Body('clubId') clubId: string,
    @Request() req: { user: RequestUser },
  ) {
    return this.membershipService.inviteClub(id, clubId, req.user.sub);
  }

  @Post('accept-invitation/:id')
  @UseGuards(JwtAuthGuard)
  async acceptInvitation(@Param('id') id: string, @Request() req: { user: RequestUser }) {
    const membership = await this.membershipService.findOne(id);
    await this.clubMembershipService.assertCanManageClub(
      req.user.sub,
      membership.club.id,
      req.user.role,
    );
    return this.membershipService.acceptInvitation(id);
  }

  @Delete('membership/:id')
  @UseGuards(JwtAuthGuard)
  async removeMembership(@Param('id') id: string, @Request() req: { user: RequestUser }) {
    const membership = await this.membershipService.findOne(id);
    const isSelfRemoval = await this.clubMembershipService.isClubAdmin(
      req.user.sub,
      membership.club.id,
    );

    if (!isSelfRemoval) {
      const viewer = await this.userService.findById(req.user.sub);
      if (
        !this.permissionsService.canManageFederation(
          req.user,
          membership.federation.id,
          viewer?.managedFederation?.id,
        )
      ) {
        throw new ForbiddenException();
      }
    }

    return this.membershipService.removeMembership(id, req.user.sub, isSelfRemoval);
  }

  private async assertCanViewFederationMembers(
    user: RequestUser,
    federationId: string,
  ): Promise<void> {
    if (user.role === UserRoles.GeneralAdmin) {
      return;
    }

    const viewer = await this.userService.findById(user.sub);
    if (
      this.permissionsService.canManageFederation(user, federationId, viewer?.managedFederation?.id)
    ) {
      return;
    }

    if (user.role === UserRoles.ClubAdmin) {
      const adminClub = await this.clubMembershipService.getAdminClub(user.sub);
      if (!adminClub) {
        throw new ForbiddenException();
      }
      const membership = await this.membershipService.findClubMembership(
        federationId,
        adminClub.id,
      );
      if (membership?.status === FederationMembershipStatus.APPROVED) {
        return;
      }
    }

    throw new ForbiddenException();
  }
}
