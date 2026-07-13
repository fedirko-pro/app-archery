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
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { UpdateUserDto, AdminUpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Roles as UserRoles, ProfileVisibilities } from './types';
import { PermissionsService } from '../auth/permissions.service';
import { RequestUser } from '../auth/permissions';

function serializeUserProfile(user: Record<string, unknown>) {
  const {
    id,
    email,
    role,
    firstName,
    lastName,
    picture,
    bio,
    location,
    country,
    appLanguage,
    federationNumber,
    nationality,
    gender,
    categories,
    syncTrainingsAndEquipment,
    profileVisibility,
    onboardingCompletedAt,
    createdAt,
    updatedAt,
  } = user as Record<string, unknown>;

  const club = user.club as { id: string; name: string } | undefined;
  const division = user.division as { id: string; name: string } | undefined;

  return {
    id,
    email,
    role,
    firstName,
    lastName,
    picture,
    bio,
    location,
    language: appLanguage ?? undefined,
    appLanguage: appLanguage ?? undefined,
    country: country ?? undefined,
    federationNumber,
    nationality,
    gender,
    categories: categories ?? [],
    clubId: club?.id ?? null,
    club: club ? { id: club.id, name: club.name } : null,
    divisionId: division?.id ?? null,
    division: division ? { id: division.id, name: division.name } : null,
    syncTrainingsAndEquipment: syncTrainingsAndEquipment ?? false,
    profileVisibility: profileVisibility ?? ProfileVisibilities.Personal,
    onboardingCompletedAt: onboardingCompletedAt ?? null,
    createdAt,
    updatedAt,
  };
}

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    // Public signup: ignore role so users cannot self-assign admin
    const dto = { ...createUserDto } as CreateUserDto & { role?: string };
    delete dto.role;
    const user = await this.userService.create(dto as CreateUserDto);
    return serializeUserProfile(user as unknown as Record<string, unknown>);
  }

  @Get('profile')
  @UseGuards(OptionalJwtAuthGuard)
  getProfile(@Request() req: { user?: RequestUser | null }) {
    if (!req.user) return null;

    return this.userService.findById(req.user.sub).then((user) => {
      if (!user) return null;
      return serializeUserProfile(user as unknown as Record<string, unknown>);
    });
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req: { user: RequestUser }, @Body() updateUserDto: UpdateUserDto) {
    const isAdmin = this.permissionsService.canManageUsers(req.user);
    const user = await this.userService.update(req.user.sub, updateUserDto, isAdmin);
    return serializeUserProfile(user as unknown as Record<string, unknown>);
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(
    @Request() req: { user: RequestUser },
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(req.user.sub, changePasswordDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req: { user: RequestUser }) {
    if (req.user.sub !== id && !this.permissionsService.canDeleteUser(req.user)) {
      throw new ForbiddenException();
    }
    return this.userService.remove(id);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin, UserRoles.ClubAdmin, UserRoles.FederationAdmin)
  getAllUsers(@Request() req: { user: RequestUser }) {
    return this.userService.getUsersForAdmin(req.user.sub, req.user.role);
  }

  /**
   * Create a new user by an administrator.
   * POST /users/admin/create
   * Sends an invitation email with a set-password link (valid 24h).
   */
  @Post('admin/create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin, UserRoles.FederationAdmin)
  async adminCreateUser(
    @Body() createUserDto: AdminCreateUserDto,
    @Request()
    req: { user: RequestUser & { firstName?: string; lastName?: string; email: string } },
  ) {
    const creatorName =
      `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email;
    const user = await this.userService.adminCreateUser(createUserDto, creatorName);
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      bio: user.bio,
      createdAt: user.createdAt,
    };
  }

  @Get('admin/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin, UserRoles.ClubAdmin, UserRoles.FederationAdmin)
  async getUserById(@Param('userId') userId: string, @Request() req: { user: RequestUser }) {
    const user = await this.userService.findById(userId);
    if (!user) return null;
    const scope = await this.userService.getAdminScope(req.user.sub, req.user.role);
    if (!this.permissionsService.canViewUserAsAdmin(req.user, user, scope)) {
      throw new ForbiddenException();
    }
    const userRecord = user as unknown as Record<string, unknown>;
    const club = userRecord.club as { id: string; name: string } | undefined;
    const division = userRecord.division as { id: string; name: string } | undefined;
    return {
      id: userRecord.id as string,
      email: userRecord.email as string,
      role: userRecord.role as string,
      firstName: userRecord.firstName as string,
      lastName: userRecord.lastName as string,
      picture: userRecord.picture as string | undefined,
      bio: userRecord.bio as string | undefined,
      location: userRecord.location as string | undefined,
      language: (userRecord.appLanguage as string) ?? undefined,
      appLanguage: userRecord.appLanguage as string | undefined,
      country: (userRecord.country as string) ?? undefined,
      federationNumber: userRecord.federationNumber as string | undefined,
      nationality: userRecord.nationality as string | undefined,
      gender: userRecord.gender as string | undefined,
      categories: userRecord.categories as string[],
      clubId: club?.id || null,
      divisionId: division?.id || null,
      division: division ? { id: division.id, name: division.name } : null,
      createdAt: userRecord.createdAt as Date,
      updatedAt: userRecord.updatedAt as Date,
    };
  }

  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin, UserRoles.ClubAdmin, UserRoles.FederationAdmin)
  async adminUpdateUser(
    @Param('id') id: string,
    @Body() updateUserDto: AdminUpdateUserDto,
    @Request()
    req: { user: RequestUser & { firstName?: string; lastName?: string; email: string } },
  ) {
    const targetUser = await this.userService.findById(id);
    if (!targetUser) {
      throw new ForbiddenException();
    }
    const scope = await this.userService.getAdminScope(req.user.sub, req.user.role);
    if (!this.permissionsService.canViewUserAsAdmin(req.user, targetUser, scope)) {
      throw new ForbiddenException();
    }

    const dto = { ...updateUserDto };
    if (!this.permissionsService.canChangeRole(req.user) && dto.role !== undefined) {
      delete dto.role;
    }
    const adminName =
      `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email;
    return this.userService.adminUpdateUser(id, dto, adminName);
  }
}
