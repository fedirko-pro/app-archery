import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PublicProfileService } from './public-profile.service';
import { UserService } from './user.service';
import { RequestUser } from '../auth/permissions';

@Controller('users')
export class PublicProfileController {
  constructor(
    private readonly publicProfileService: PublicProfileService,
    private readonly userService: UserService,
  ) {}

  @Get('public/:userId')
  getPublicProfile(@Param('userId') userId: string) {
    return this.publicProfileService.getPublicProfile(userId);
  }

  @Get('public/:userId/achievements/:achievementId')
  getPublicAchievement(
    @Param('userId') userId: string,
    @Param('achievementId') achievementId: string,
  ) {
    return this.publicProfileService.getPublicAchievementShare(userId, achievementId);
  }

  @Get(':userId/shared-profile')
  @UseGuards(JwtAuthGuard)
  async getSharedProfile(@Param('userId') userId: string, @Request() req: { user: RequestUser }) {
    const viewer = await this.userService.buildProfileViewer(req.user.sub, req.user.role);
    return this.publicProfileService.getSharedProfile(userId, viewer);
  }

  @Get(':userId/shared-profile/achievements/:achievementId')
  @UseGuards(JwtAuthGuard)
  async getSharedAchievement(
    @Param('userId') userId: string,
    @Param('achievementId') achievementId: string,
    @Request() req: { user: RequestUser },
  ) {
    const viewer = await this.userService.buildProfileViewer(req.user.sub, req.user.role);
    return this.publicProfileService.getSharedAchievement(userId, achievementId, viewer);
  }
}
