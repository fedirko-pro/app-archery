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
  Res,
  Request,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Response } from 'express';
import { format } from 'date-fns';
import { PatrolService } from './patrol.service';
import { BatchUpdatePatrolsDto } from './dto/batch-update-patrols.dto';
import { Patrol } from './patrol.entity';
import { PatrolRole } from './patrol-member.entity';
import { TournamentService } from './tournament.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Roles as UserRoles } from '../user/types';
import { PermissionsService } from '../auth/permissions.service';
import { RequestUser } from '../auth/permissions';

function redactPatrolEmails(patrol: Record<string, unknown>): Record<string, unknown> {
  const leader = patrol.leader as Record<string, unknown> | undefined;
  const redactedLeader = leader ? { ...leader } : undefined;
  if (redactedLeader) {
    delete redactedLeader.email;
  }

  const members = Array.isArray(patrol.members)
    ? patrol.members.map((member) => {
        const entry = { ...(member as Record<string, unknown>) };
        const user = entry.user as Record<string, unknown> | undefined;
        if (user) {
          const redactedUser = { ...user };
          delete redactedUser.email;
          entry.user = redactedUser;
        }
        return entry;
      })
    : patrol.members;

  return {
    ...patrol,
    leader: redactedLeader,
    members,
  };
}

@Controller('patrols')
export class PatrolController {
  constructor(
    private readonly patrolService: PatrolService,
    private readonly tournamentService: TournamentService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin, UserRoles.FederationAdmin)
  @Post()
  async create(@Body() data: Partial<Patrol>) {
    return this.patrolService.create(data);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req: { user: RequestUser }) {
    if (!this.permissionsService.canManagePatrols(req.user)) {
      throw new ForbiddenException();
    }
    return this.patrolService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('tournament/:tournamentId')
  async findByTournament(
    @Param('tournamentId') tournamentId: string,
    @Request() req: { user: RequestUser },
  ) {
    let tournament;
    try {
      tournament = await this.tournamentService.findById(tournamentId);
    } catch {
      throw new NotFoundException('Tournament not found');
    }
    if (!this.permissionsService.canViewPatrols(req.user, tournament)) {
      throw new ForbiddenException();
    }
    const patrols = await this.patrolService.findByTournament(tournamentId);
    if (this.permissionsService.canManagePatrols(req.user)) {
      return patrols;
    }
    return patrols.map((patrol) => redactPatrolEmails(patrol as Record<string, unknown>));
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: { user: RequestUser }) {
    const patrol = await this.patrolService.findById(id);
    const tournamentId = (patrol.tournament as { id: string }).id;
    let tournament;
    try {
      tournament = await this.tournamentService.findById(tournamentId);
    } catch {
      throw new NotFoundException('Tournament not found');
    }
    if (!this.permissionsService.canViewPatrols(req.user, tournament)) {
      throw new ForbiddenException();
    }
    if (this.permissionsService.canManagePatrols(req.user)) {
      return patrol;
    }
    return redactPatrolEmails(patrol);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin, UserRoles.FederationAdmin)
  @Put(':id')
  async update(@Param('id') id: string, @Body() data: Partial<Patrol>) {
    return this.patrolService.update(id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin, UserRoles.FederationAdmin)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.patrolService.remove(id);
  }

  /**
   * Delete patrol and redistribute its members into remaining patrols of the tournament.
   * POST /patrols/:patrolId/delete-and-redistribute
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin, UserRoles.FederationAdmin)
  @Post(':patrolId/delete-and-redistribute')
  async deleteAndRedistribute(@Param('patrolId') patrolId: string) {
    return this.patrolService.deletePatrolAndRedistribute(patrolId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin, UserRoles.FederationAdmin)
  @Post(':patrolId/members')
  async addMember(
    @Param('patrolId') patrolId: string,
    @Body() data: { userId: string; role: string },
  ) {
    return this.patrolService.addMember(patrolId, data.userId, data.role as PatrolRole);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin, UserRoles.FederationAdmin)
  @Delete(':patrolId/members/:userId')
  async removeMember(@Param('patrolId') patrolId: string, @Param('userId') userId: string) {
    return this.patrolService.removeMember(patrolId, userId);
  }

  /**
   * Generate patrols for a tournament based on all approved applications
   * POST /patrols/tournaments/:tournamentId/generate
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin, UserRoles.FederationAdmin)
  @Post('tournaments/:tournamentId/generate')
  async generatePatrols(@Param('tournamentId') tournamentId: string) {
    return this.patrolService.generatePatrolsForTournament(tournamentId);
  }

  /**
   * Generate and save patrols to database
   * POST /patrols/tournaments/:tournamentId/generate-and-save
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin, UserRoles.FederationAdmin)
  @Post('tournaments/:tournamentId/generate-and-save')
  async generateAndSavePatrols(
    @Param('tournamentId') tournamentId: string,
    @Query('force') force?: string,
  ) {
    const existingPatrols = await this.patrolService.findByTournament(tournamentId);

    if (existingPatrols.length > 0 && force !== 'true') {
      throw new ConflictException(
        'Patrols already exist for this tournament. Use ?force=true to regenerate.',
      );
    }

    if (existingPatrols.length > 0 && force === 'true') {
      for (const patrol of existingPatrols) {
        await this.patrolService.remove(patrol.id as string);
      }
    }

    const generatedPatrols = await this.patrolService.generatePatrolsForTournament(tournamentId);

    const savedPatrols = await this.patrolService.saveGeneratedPatrols(
      tournamentId,
      generatedPatrols,
    );

    return {
      patrols: savedPatrols,
      stats: generatedPatrols.stats,
    };
  }

  /**
   * Batch-update patrol member layout for a tournament.
   * PUT /patrols/tournaments/:tournamentId/batch
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin, UserRoles.FederationAdmin)
  @Put('tournaments/:tournamentId/batch')
  async batchUpdatePatrols(
    @Param('tournamentId') tournamentId: string,
    @Body() body: BatchUpdatePatrolsDto,
  ) {
    return this.patrolService.batchUpdatePatrolLayout(
      tournamentId,
      body.patrols.map((patrol) => ({
        id: patrol.id,
        members: patrol.members.map((member) => ({
          userId: member.userId,
          role: member.role as PatrolRole,
        })),
      })),
    );
  }

  /**
   * Generate PDF for patrols of a tournament
   * GET /patrols/tournaments/:tournamentId/pdf
   */
  @UseGuards(JwtAuthGuard)
  @Get('tournaments/:tournamentId/pdf')
  async generatePatrolPdf(
    @Param('tournamentId') tournamentId: string,
    @Request() req: { user: RequestUser },
    @Res() res: Response,
  ) {
    if (!this.permissionsService.canManagePatrols(req.user)) {
      throw new ForbiddenException();
    }

    const { buffer, tournamentTitle, startDate } =
      await this.patrolService.generatePatrolPdf(tournamentId);

    const sanitizedTitle = tournamentTitle
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase();
    const dateStr = format(startDate, 'dd-MM-yyyy');
    const filename = `patrols-list-${sanitizedTitle}-${dateStr}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }

  /**
   * Generate PDF with score cards for all patrol members
   * GET /patrols/tournaments/:tournamentId/score-cards-pdf
   */
  @UseGuards(JwtAuthGuard)
  @Get('tournaments/:tournamentId/score-cards-pdf')
  async generateScoreCardsPdf(
    @Param('tournamentId') tournamentId: string,
    @Request() req: { user: RequestUser },
    @Res() res: Response,
  ) {
    if (!this.permissionsService.canManagePatrols(req.user)) {
      throw new ForbiddenException();
    }

    const { buffer, tournamentTitle, startDate } =
      await this.patrolService.generateScoreCardsPdf(tournamentId);

    const sanitizedTitle = tournamentTitle
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase();
    const dateStr = format(startDate, 'dd-MM-yyyy');
    const filename = `score-cards-${sanitizedTitle}-${dateStr}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }
}
