import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { UploadAuthorizationService } from './upload-authorization.service';
import { Tournament } from '../tournament/tournament.entity';
import { ClubMembership } from '../club/club-membership.entity';
import { RolePermissionsModule } from '../auth/role-permissions.module';

@Module({
  imports: [MikroOrmModule.forFeature([Tournament, ClubMembership]), RolePermissionsModule],
  controllers: [UploadController],
  providers: [UploadService, UploadAuthorizationService],
  exports: [UploadService],
})
export class UploadModule {}
