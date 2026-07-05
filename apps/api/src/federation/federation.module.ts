import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { FederationService } from './federation.service';
import { FederationMembershipService } from './federation-membership.service';
import { FederationController } from './federation.controller';
import { Federation } from './federation.entity';
import { FederationMembership } from './federation-membership.entity';
import { FederationInvitation } from './federation-invitation.entity';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([Federation, FederationMembership, FederationInvitation]),
    EmailModule,
  ],
  controllers: [FederationController],
  providers: [FederationService, FederationMembershipService],
  exports: [FederationService, FederationMembershipService],
})
export class FederationModule {}
