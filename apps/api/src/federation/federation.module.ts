import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { RolePermissionsModule } from '../auth/role-permissions.module';
import { ClubModule } from '../club/club.module';
import { EmailModule } from '../email/email.module';
import { NotificationsModule } from '../notification/notifications.module';
import { UserModule } from '../user/user.module';
import { FederationController } from './federation.controller';
import { Federation } from './federation.entity';
import { FederationService } from './federation.service';
import { FederationInvitation } from './federation-invitation.entity';
import { FederationMembership } from './federation-membership.entity';
import { FederationMembershipService } from './federation-membership.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([Federation, FederationMembership, FederationInvitation]),
    EmailModule,
    ClubModule,
    UserModule,
    RolePermissionsModule,
    NotificationsModule,
  ],
  controllers: [FederationController],
  providers: [FederationService, FederationMembershipService],
  exports: [FederationService, FederationMembershipService],
})
export class FederationModule {}
