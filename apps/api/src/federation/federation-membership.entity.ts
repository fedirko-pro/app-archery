import { Entity, ManyToOne, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import { Club } from '../club/club.entity';
import { User } from '../user/entity/user.entity';
import { Federation } from './federation.entity';

export enum FederationMembershipStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity()
@Unique({ properties: ['federation', 'club'] })
export class FederationMembership {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne(() => Federation)
  federation: Federation;

  @ManyToOne(() => Club)
  club: Club;

  @Property({ type: 'string' })
  status: FederationMembershipStatus = FederationMembershipStatus.PENDING;

  @ManyToOne(() => User, { nullable: true })
  invitedBy?: User;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date = new Date();

  @Property({ onUpdate: () => new Date(), nullable: true })
  updatedAt?: Date;
}
