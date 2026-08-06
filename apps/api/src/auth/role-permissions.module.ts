import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { RolePermission } from './entity/role-permission.entity';
import { PermissionsService } from './permissions.service';
import { RolePermissionsService } from './role-permissions.service';

@Module({
  imports: [MikroOrmModule.forFeature([RolePermission])],
  providers: [RolePermissionsService, PermissionsService],
  exports: [RolePermissionsService, PermissionsService],
})
export class RolePermissionsModule {}
