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
} from '@nestjs/common';
import { TrainingService } from './training.service';
import { CreateTrainingSessionDto } from './dto/create-training-session.dto';
import { UpdateTrainingSessionDto } from './dto/update-training-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AchievementsService } from '../user/achievements.service';

interface ReqWithUser {
  user: { sub: string };
}

@Controller('trainings')
@UseGuards(JwtAuthGuard)
export class TrainingController {
  constructor(
    private readonly trainingService: TrainingService,
    private readonly achievementsService: AchievementsService,
  ) {}

  private syncAchievements(userId: string): void {
    void this.achievementsService.syncComputed(userId).catch(() => {
      /* non-blocking */
    });
  }

  @Post()
  create(@Request() req: ReqWithUser, @Body() createDto: CreateTrainingSessionDto) {
    const result = this.trainingService.create(req.user.sub, createDto);
    this.syncAchievements(req.user.sub);
    return result;
  }

  @Get()
  findAll(@Request() req: ReqWithUser) {
    return this.trainingService.findAllForUser(req.user.sub);
  }

  @Get('stats')
  getStats(@Request() req: ReqWithUser) {
    return this.trainingService.getStats(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: ReqWithUser) {
    return this.trainingService.findOne(id, req.user.sub);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req: ReqWithUser,
    @Body() updateDto: UpdateTrainingSessionDto,
  ) {
    const result = await this.trainingService.update(id, req.user.sub, updateDto);
    this.syncAchievements(req.user.sub);
    return result;
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: ReqWithUser) {
    await this.trainingService.remove(id, req.user.sub);
    this.syncAchievements(req.user.sub);
  }

  @Post('bulk-sync')
  async bulkSync(@Request() req: ReqWithUser, @Body() sessions: CreateTrainingSessionDto[]) {
    const result = await this.trainingService.bulkSync(req.user.sub, sessions);
    this.syncAchievements(req.user.sub);
    return result;
  }
}
