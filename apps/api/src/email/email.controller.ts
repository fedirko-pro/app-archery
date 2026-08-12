import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles as UserRoles } from '../user/types';
import { EmailService } from './email.service';
import { getEmailI18n } from './i18n';
import { wrapEmail } from './templates';

interface TestEmailDto {
  to: string;
  subject?: string;
  message?: string;
}

@Controller('email')
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  private assertDevOnly(): void {
    if (this.configService.get<string>('NODE_ENV') === 'production') {
      throw new NotFoundException();
    }
  }

  @Get('config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin)
  @HttpCode(HttpStatus.OK)
  getEmailConfig() {
    this.assertDevOnly();
    return {
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      from: `"${this.configService.get<string>('SMTP_FROM_NAME')}" <${this.configService.get<string>('SMTP_FROM_EMAIL')}>`,
      passwordConfigured: !!this.configService.get<string>('SMTP_PASSWORD'),
    };
  }

  @Post('test')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.GeneralAdmin)
  @HttpCode(HttpStatus.OK)
  async sendTestEmail(@Body() testEmailDto: TestEmailDto) {
    this.assertDevOnly();
    const {
      to,
      subject = 'Test Email',
      message = 'This is a test email from Sokil',
    } = testEmailDto;

    const t = getEmailI18n('en');
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const supportEmail = this.configService.get<string>('SUPPORT_EMAIL');
    const contentHtml = `
      <h2>${subject}</h2>
      <p>${message}</p>
      <p>This is a test email sent from the Sokil email service.</p>
    `;
    const contentText = `${subject}\n\n${message}\n\nThis is a test email sent from the Sokil email service.`;

    const { html, text } = wrapEmail({
      contentHtml,
      contentText,
      footerText: t.footer,
      appDescription: t.appDescription,
      supportLabel: t.supportLabel,
      supportAction: t.supportAction,
      signOff: t.signOff,
      teamName: t.teamName,
      previewText: message,
      frontendUrl,
      supportEmail,
    });

    await this.emailService.sendEmail({
      to,
      subject,
      html,
      text,
    });

    return {
      success: true,
      message: `Test email sent successfully to ${to}`,
    };
  }
}
