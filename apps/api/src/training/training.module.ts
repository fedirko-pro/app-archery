import { Module, forwardRef } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { TrainingService } from './training.service';
import { TrainingController } from './training.controller';
import { TrainingSession } from './training-session.entity';
import { AchievementsModule } from '../achievements/achievements.module';

@Module({
  imports: [MikroOrmModule.forFeature([TrainingSession]), forwardRef(() => AchievementsModule)],
  controllers: [TrainingController],
  providers: [TrainingService],
  exports: [TrainingService],
})
export class TrainingModule {}
