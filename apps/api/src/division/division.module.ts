import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { DivisionController } from './division.controller';
import { Division } from './division.entity';
import { DivisionService } from './division.service';

@Module({
  imports: [MikroOrmModule.forFeature([Division])],
  controllers: [DivisionController],
  providers: [DivisionService],
  exports: [DivisionService],
})
export class DivisionModule {}
