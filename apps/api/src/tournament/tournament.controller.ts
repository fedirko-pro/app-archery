import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { wrap } from '@mikro-orm/core';
import { TournamentService } from './tournament.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Roles as UserRoles } from '../user/types';
import { PermissionsService } from '../auth/permissions.service';
import { RequestUser } from '../auth/permissions';

function serializeCreatedBy(
  createdBy:
    | {
        id: string;
        firstName?: string;
        lastName?: string;
        picture?: string;
        role: string;
      }
    | null
    | undefined,
) {
  if (!createdBy) {
    return null;
  }
  return {
    id: createdBy.id,
    firstName: createdBy.firstName,
    lastName: createdBy.lastName,
    picture: createdBy.picture,
    role: createdBy.role,
  };
}

@Controller('tournaments')
export class TournamentController {
  constructor(
    private readonly tournamentService: TournamentService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin, UserRoles.ClubAdmin, UserRoles.FederationAdmin)
  @Post()
  async create(@Body() data: Record<string, unknown>, @Request() req: { user: RequestUser }) {
    if (!this.permissionsService.canCreateTournament(req.user)) {
      throw new ForbiddenException();
    }
    return this.tournamentService.create({
      ...data,
      createdBy: req.user.sub,
    } as unknown as Parameters<typeof this.tournamentService.create>[0]);
  }

  @Get()
  async findAll(@Query('country') country?: string, @Query('upcoming') upcoming?: string) {
    const upcomingFilter = upcoming === 'true' ? true : upcoming === 'false' ? false : undefined;
    const tournaments = await this.tournamentService.findAll({
      country: country || undefined,
      upcoming: upcomingFilter,
    });
    // Serialize to plain JSON to avoid class-transformer issues with Patrol class
    return tournaments.map((t) => {
      const json: Record<string, unknown> = wrap(t).toJSON() as Record<string, unknown>;
      return {
        ...json,
        ruleCode: t.rule?.ruleCode || null,
        rule: t.rule
          ? {
              id: t.rule.id,
              ruleCode: t.rule.ruleCode,
              ruleName: t.rule.ruleName,
            }
          : null,
        createdBy: serializeCreatedBy(t.createdBy),
      };
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const tournament = await this.tournamentService.findById(id);
    const json: Record<string, unknown> = wrap(tournament).toJSON() as Record<string, unknown>;
    json.ruleCode = tournament.rule?.ruleCode || null;
    json.createdBy = serializeCreatedBy(tournament.createdBy);
    return json;
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: Record<string, unknown>,
    @Request() req: { user: RequestUser },
  ) {
    const tournament = await this.tournamentService.findById(id);
    if (!this.permissionsService.canUpdateTournament(req.user, tournament)) {
      throw new ForbiddenException();
    }
    return this.tournamentService.update(id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin, UserRoles.FederationAdmin)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: { user: RequestUser }) {
    if (!this.permissionsService.canDeleteTournament(req.user)) {
      throw new ForbiddenException();
    }
    return this.tournamentService.remove(id);
  }
}
