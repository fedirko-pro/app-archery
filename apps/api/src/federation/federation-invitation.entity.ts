import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import { Federation } from './federation.entity';
import { Club } from '../club/club.entity';
import { User } from '../user/entity/user.entity';

export enum FederationInvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  EXPIRED = 'expired',
  IGNORED = 'ignored',
}

@Entity()
export class FederationInvitation {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne(() => Federation)
  federation: Federation;

  @ManyToOne(() => Club)
  club: Club;

  @ManyToOne(() => User)
  invitedBy: User;

  @Property({ unique: true })
  token: string = uuid();

  @Property({ type: 'string' })
  status: FederationInvitationStatus = FederationInvitationStatus.PENDING;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date = new Date();
}
