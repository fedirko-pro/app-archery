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
import { EquipmentService } from './equipment.service';
import { CreateEquipmentSetDto } from './dto/create-equipment-set.dto';
import { UpdateEquipmentSetDto } from './dto/update-equipment-set.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface ReqWithUser {
  user: { sub: string };
}

@Controller('equipment-sets')
@UseGuards(JwtAuthGuard)
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Post()
  create(@Request() req: ReqWithUser, @Body() createDto: CreateEquipmentSetDto) {
    return this.equipmentService.create(req.user.sub, createDto);
  }

  @Get()
  findAll(@Request() req: ReqWithUser) {
    return this.equipmentService.findAllForUser(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: ReqWithUser) {
    return this.equipmentService.findOne(id, req.user.sub);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req: ReqWithUser,
    @Body() updateDto: UpdateEquipmentSetDto,
  ) {
    return this.equipmentService.update(id, req.user.sub, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: ReqWithUser) {
    return this.equipmentService.remove(id, req.user.sub);
  }

  @Post('bulk-sync')
  bulkSync(@Request() req: ReqWithUser, @Body() sets: CreateEquipmentSetDto[]) {
    return this.equipmentService.bulkSync(req.user.sub, sets);
  }
}
