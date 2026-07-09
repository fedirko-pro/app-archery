import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { ClubService } from './club.service';
import { ClubMembershipService } from './club-membership.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRoles } from '../user/types';
import { RequestUser } from '../auth/permissions';

@Controller('clubs')
export class ClubController {
  constructor(
    private readonly clubService: ClubService,
    private readonly membershipService: ClubMembershipService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin)
  create(@Body() createClubDto: CreateClubDto) {
    return this.clubService.create(createClubDto);
  }

  @Get()
  findAll(
    @Query('country') country?: string,
    @Query('visibility') visibility?: string,
    @Query('search') search?: string,
  ) {
    return this.clubService.findAll({ country, visibility, search });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clubService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateClubDto: UpdateClubDto,
    @Request() req: { user: RequestUser },
  ) {
    await this.membershipService.assertCanManageClub(req.user.sub, id, req.user.role);
    return this.clubService.update(id, updateClubDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin)
  remove(@Param('id') id: string) {
    return this.clubService.remove(id);
  }
}
