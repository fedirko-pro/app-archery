import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import { User } from '../user/entity/user.entity';
import { Club } from './club.entity';

export enum ClubInvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  EXPIRED = 'expired',
  IGNORED = 'ignored',
}

@Entity()
export class ClubInvitation {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne(() => Club)
  club: Club;

  @Property()
  email: string;

  @ManyToOne(() => User)
  invitedBy: User;

  @Property({ unique: true })
  token: string = uuid();

  @Property({ type: 'string' })
  status: ClubInvitationStatus = ClubInvitationStatus.PENDING;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date = new Date();
}
