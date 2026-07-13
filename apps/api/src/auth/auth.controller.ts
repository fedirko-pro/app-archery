import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  UseGuards,
  Request,
  Res,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserLoginDto } from './dto/user-login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { UpdateRolePermissionDto } from './dto/update-role-permission.dto';
import { OAuthExchangeDto } from './dto/oauth-exchange.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { SkipCsrf } from './decorators/skip-csrf.decorator';
import { Request as ExpressRequest, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Roles as UserRoles } from '../user/types';
import { RolePermissionsService } from './role-permissions.service';
import { OAuthExchangeService } from './oauth-exchange.service';
import { CsrfService } from './csrf.service';
import { SESSION_COOKIE_NAME } from './utils/cookie-options';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly rolePermissionsService: RolePermissionsService,
    private readonly oauthExchangeService: OAuthExchangeService,
    private readonly csrfService: CsrfService,
  ) {}

  @Post('login')
  @SkipCsrf()
  async login(
    @Body() loginDto: UserLoginDto,
    @Request() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(loginDto, res, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req: ExpressRequest, @Res({ passthrough: true }) res: Response) {
    const sessionToken = req.cookies?.[SESSION_COOKIE_NAME] as string | undefined;
    return this.authService.logout(res, sessionToken);
  }

  @Get('csrf')
  @SkipCsrf()
  getCsrf(@Res({ passthrough: true }) res: Response) {
    const token = this.csrfService.issueToken(res);
    return { csrfToken: token };
  }

  @Post('oauth/exchange')
  @SkipCsrf()
  async exchangeOAuthCode(
    @Body() dto: OAuthExchangeDto,
    @Request() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.exchangeOAuthCode(dto.code, res, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });
  }

  @Post('forgot-password')
  @SkipCsrf()
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @SkipCsrf()
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('set-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async setPasswordForOAuthUser(
    @Request() req: ExpressRequest,
    @Body() setPasswordDto: SetPasswordDto,
  ): Promise<{ message: string }> {
    const user = req.user as { sub: string };
    return this.authService.setPasswordForOAuthUser(user.sub, setPasswordDto);
  }

  @Get('google')
  @SkipCsrf()
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @SkipCsrf()
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Request() req: ExpressRequest, @Res() res: Response) {
    const { user } = req.user as { user: import('../user/entity/user.entity').User };
    const code = await this.oauthExchangeService.createExchangeCode(user);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    res.redirect(`${frontendUrl}/auth/google/callback?code=${code}`);
  }

  @Post('admin/reset-password/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin, UserRoles.FederationAdmin)
  @HttpCode(HttpStatus.OK)
  async adminResetUserPassword(@Param('userId') userId: string): Promise<{ message: string }> {
    return this.authService.adminResetUserPassword(userId);
  }

  @Get('admin/role-permissions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin, UserRoles.ClubAdmin, UserRoles.FederationAdmin)
  getRolePermissions() {
    return this.rolePermissionsService.getMatrix();
  }

  @Patch('admin/role-permissions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin)
  @HttpCode(HttpStatus.OK)
  async updateRolePermission(@Body() dto: UpdateRolePermissionDto) {
    await this.rolePermissionsService.setPermission(dto.role, dto.permissionKey, dto.enabled);
    return { message: 'OK' };
  }
}
