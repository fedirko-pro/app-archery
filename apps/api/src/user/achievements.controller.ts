import {
  Controller,
  Get,
  Post,
  Param,
  Request,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Roles as UserRoles } from './types';
import { AchievementsService } from './achievements.service';
import { UserService } from './user.service';
import { ProfileVisibilityService } from './profile-visibility.service';
import { RequestUser } from '../auth/permissions';

@Controller('users')
export class AchievementsController {
  constructor(
    private readonly achievementsService: AchievementsService,
    private readonly userService: UserService,
    private readonly visibilityService: ProfileVisibilityService,
  ) {}

  @Get('me/achievements')
  @UseGuards(JwtAuthGuard)
  async getMyAchievements(@Request() req: { user: RequestUser }) {
    return this.achievementsService.getForUser(req.user.sub, true);
  }

  @Post('me/achievements/sync')
  @UseGuards(JwtAuthGuard)
  async syncMyAchievements(@Request() req: { user: RequestUser }) {
    const newlyUnlocked = await this.achievementsService.syncComputed(req.user.sub);
    return { newlyUnlocked };
  }

  @Get('public/:userId/achievements')
  async getPublicAchievements(@Param('userId') userId: string) {
    const user = await this.userService.findById(userId);
    if (!user || !this.visibilityService.canViewPublicUnauthenticated(user)) {
      throw new NotFoundException('Achievements not found');
    }
    return this.achievementsService.getForUser(userId, false);
  }

  @Get(':userId/shared-profile/achievements')
  @UseGuards(JwtAuthGuard)
  async getSharedAchievements(
    @Param('userId') userId: string,
    @Request() req: { user: RequestUser },
  ) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('Achievements not found');
    }

    const viewer = await this.userService.buildProfileViewer(req.user.sub, req.user.role);
    const level = this.visibilityService.resolveViewLevel(user, viewer);

    if (level === 'none') {
      throw new NotFoundException('Achievements not found');
    }

    return this.achievementsService.getForUser(userId, false);
  }

  @Get('public/:userId/progress')
  async getPublicProgress(@Param('userId') userId: string) {
    const user = await this.userService.findById(userId);
    if (!user || !this.visibilityService.canViewPublicUnauthenticated(user)) {
      throw new NotFoundException('Progress not found');
    }
    return this.achievementsService.getPublicProgressShare(userId);
  }

  @Get(':userId/shared-profile/progress')
  @UseGuards(JwtAuthGuard)
  async getSharedProgress(@Param('userId') userId: string, @Request() req: { user: RequestUser }) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('Progress not found');
    }

    const viewer = await this.userService.buildProfileViewer(req.user.sub, req.user.role);
    const level = this.visibilityService.resolveViewLevel(user, viewer);

    if (level === 'none') {
      throw new NotFoundException('Progress not found');
    }

    return this.achievementsService.getPublicProgressShare(userId);
  }
}

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoles.GeneralAdmin, UserRoles.FederationAdmin)
export class AdminAchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Post(':userId/achievements/:achievementId/grant')
  async grantAchievement(
    @Param('userId') userId: string,
    @Param('achievementId') achievementId: string,
  ) {
    const granted = await this.achievementsService.grant(userId, achievementId);
    return { granted };
  }
}
