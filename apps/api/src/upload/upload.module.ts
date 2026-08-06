import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { RolePermissionsModule } from '../auth/role-permissions.module';
import { ClubMembership } from '../club/club-membership.entity';
import { Tournament } from '../tournament/tournament.entity';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { UploadAuthorizationService } from './upload-authorization.service';

@Module({
  imports: [MikroOrmModule.forFeature([Tournament, ClubMembership]), RolePermissionsModule],
  controllers: [UploadController],
  providers: [UploadService, UploadAuthorizationService],
  exports: [UploadService],
})
export class UploadModule {}
