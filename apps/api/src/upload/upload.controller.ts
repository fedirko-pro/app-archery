import {
  Controller,
  Post,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { UploadImageDto } from './dto/upload-image.dto';
import { UploadAttachmentDto } from './dto/upload-attachment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadAuthorizationService } from './upload-authorization.service';
import type { RequestUser } from '../auth/permissions';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly uploadAuthorizationService: UploadAuthorizationService,
  ) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file', { limits: UploadService.multerImageLimits }))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadImageDto,
    @Request() req: { user: RequestUser },
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    let entityId = dto.entityId;

    if (dto.type === 'avatar') {
      entityId = this.uploadAuthorizationService.assertCanUploadAvatar(req.user, dto.entityId);
    } else if (dto.type === 'banner') {
      if (!dto.entityId) {
        throw new BadRequestException('entityId is required for banner uploads');
      }
      await this.uploadAuthorizationService.assertCanUploadBanner(req.user, dto.entityId);
    } else if (dto.type === 'logo') {
      if (!dto.entityId) {
        throw new BadRequestException('entityId is required for logo uploads');
      }
      await this.uploadAuthorizationService.assertCanUploadLogo(req.user, dto.entityId);
    }

    const result = await this.uploadService.processAndSaveImage(file, {
      type: dto.type,
      entityId,
      cropX: dto.cropX,
      cropY: dto.cropY,
      cropWidth: dto.cropWidth,
      cropHeight: dto.cropHeight,
      quality: dto.quality,
    });

    return result;
  }

  @Post('attachment')
  @UseInterceptors(FileInterceptor('file', { limits: UploadService.multerAttachmentLimits }))
  async uploadAttachment(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadAttachmentDto,
    @Request() req: { user: RequestUser },
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    await this.uploadAuthorizationService.assertCanManageTournamentAttachments(
      req.user,
      dto.tournamentId,
    );

    const result = await this.uploadService.saveAttachment(file, dto.tournamentId);

    return result;
  }

  @Delete('attachment/:tournamentId/:filename')
  async deleteAttachment(
    @Param('tournamentId') tournamentId: string,
    @Param('filename') filename: string,
    @Request() req: { user: RequestUser },
  ) {
    await this.uploadAuthorizationService.assertCanManageTournamentAttachments(
      req.user,
      tournamentId,
    );

    await this.uploadService.deleteAttachment(tournamentId, filename);
    return { message: 'Attachment deleted successfully' };
  }
}
