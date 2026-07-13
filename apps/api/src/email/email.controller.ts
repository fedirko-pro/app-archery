import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Roles as UserRoles } from '../user/types';
import { styleContainer, styleHeading, styleHr, styleFooter } from './templates/theme';

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
      message = 'This is a test email from Archery App',
    } = testEmailDto;

    const html = `
      <div style="${styleContainer()}">
        <h2 style="${styleHeading()}">${subject}</h2>
        <p>${message}</p>
        <p>This is a test email sent from the Archery App email service.</p>
        <hr style="${styleHr()}">
        <p style="${styleFooter()}">Test email - Archery App</p>
      </div>
    `;

    const text = `
      ${subject}

      ${message}

      This is a test email sent from the Archery App email service.

      Test email - Archery App
    `;

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
