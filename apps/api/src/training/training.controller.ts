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

interface ReqWithUser {
  user: { sub: string };
}

@Controller('trainings')
@UseGuards(JwtAuthGuard)
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Post()
  create(@Request() req: ReqWithUser, @Body() createDto: CreateTrainingSessionDto) {
    return this.trainingService.create(req.user.sub, createDto);
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
  update(
    @Param('id') id: string,
    @Request() req: ReqWithUser,
    @Body() updateDto: UpdateTrainingSessionDto,
  ) {
    return this.trainingService.update(id, req.user.sub, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: ReqWithUser) {
    return this.trainingService.remove(id, req.user.sub);
  }

  @Post('bulk-sync')
  bulkSync(@Request() req: ReqWithUser, @Body() sessions: CreateTrainingSessionDto[]) {
    return this.trainingService.bulkSync(req.user.sub, sessions);
  }
}
