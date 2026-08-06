import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRoles } from '../user/types';
import type { BowCategoryService } from './bow-category.service';
import type { CreateBowCategoryDto } from './dto/create-bow-category.dto';
import type { UpdateBowCategoryDto } from './dto/update-bow-category.dto';

@Controller('bow-categories')
export class BowCategoryController {
  constructor(private readonly bowCategoryService: BowCategoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin)
  create(@Body() createBowCategoryDto: CreateBowCategoryDto) {
    return this.bowCategoryService.create(createBowCategoryDto);
  }

  @Get()
  findAll(@Query('ruleId') ruleId?: string) {
    return this.bowCategoryService.findAll(ruleId);
  }

  @Get('code/:code')
  findByCode(@Param('code') code: string, @Query('ruleId') ruleId?: string) {
    return this.bowCategoryService.findByCode(code, ruleId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bowCategoryService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin)
  update(@Param('id') id: string, @Body() updateBowCategoryDto: UpdateBowCategoryDto) {
    return this.bowCategoryService.update(id, updateBowCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin)
  remove(@Param('id') id: string) {
    return this.bowCategoryService.remove(id);
  }
}
