import { MikroOrmModule } from '@mikro-orm/nestjs';
import { forwardRef, Module } from '@nestjs/common';
import { AchievementsModule } from '../achievements/achievements.module';
import { TrainingController } from './training.controller';
import { TrainingService } from './training.service';
import { TrainingSession } from './training-session.entity';

@Module({
  imports: [MikroOrmModule.forFeature([TrainingSession]), forwardRef(() => AchievementsModule)],
  controllers: [TrainingController],
  providers: [TrainingService],
  exports: [TrainingService],
})
export class TrainingModule {}
