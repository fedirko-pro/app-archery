import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { BowCategoryController } from './bow-category.controller';
import { BowCategory } from './bow-category.entity';
import { BowCategoryService } from './bow-category.service';

@Module({
  imports: [MikroOrmModule.forFeature([BowCategory])],
  controllers: [BowCategoryController],
  providers: [BowCategoryService],
  exports: [BowCategoryService],
})
export class BowCategoryModule {}
