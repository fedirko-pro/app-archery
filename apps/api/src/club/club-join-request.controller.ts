import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestUser } from '../auth/permissions';
import { ClubJoinRequestService } from './club-join-request.service';
import { CreateClubJoinRequestDto } from './dto/create-club-join-request.dto';

@Controller('clubs')
export class ClubJoinRequestController {
  constructor(private readonly joinRequestService: ClubJoinRequestService) {}

  @Post(':clubId/join-requests')
  @UseGuards(JwtAuthGuard)
  create(
    @Param('clubId') clubId: string,
    @Body() dto: CreateClubJoinRequestDto,
    @Request() req: { user: RequestUser },
  ) {
    return this.joinRequestService.create(clubId, dto, req.user.sub);
  }

  @Get(':clubId/join-requests')
  @UseGuards(JwtAuthGuard)
  findForClub(@Param('clubId') clubId: string, @Request() req: { user: RequestUser }) {
    return this.joinRequestService.findForClub(clubId, req.user.sub, req.user.role);
  }

  @Patch('join-requests/:requestId/approve')
  @UseGuards(JwtAuthGuard)
  approve(@Param('requestId') requestId: string, @Request() req: { user: RequestUser }) {
    return this.joinRequestService.approve(requestId, req.user.sub, req.user.role);
  }

  @Patch('join-requests/:requestId/reject')
  @UseGuards(JwtAuthGuard)
  reject(@Param('requestId') requestId: string, @Request() req: { user: RequestUser }) {
    return this.joinRequestService.reject(requestId, req.user.sub, req.user.role);
  }
}
