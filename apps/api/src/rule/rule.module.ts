import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { RuleController } from './rule.controller';
import { Rule } from './rule.entity';
import { RuleService } from './rule.service';

@Module({
  imports: [MikroOrmModule.forFeature([Rule])],
  controllers: [RuleController],
  providers: [RuleService],
  exports: [RuleService],
})
export class RuleModule {}
