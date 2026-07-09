import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import { Club } from './club.entity';
import { User } from '../user/entity/user.entity';

export enum ClubJoinRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity()
export class ClubJoinRequest {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne(() => Club)
  club: Club;

  @Property()
  name: string;

  @Property()
  email: string;

  @Property({ nullable: true })
  message?: string;

  @Property({ type: 'string' })
  status: ClubJoinRequestStatus = ClubJoinRequestStatus.PENDING;

  @ManyToOne(() => User, { nullable: true })
  user?: User;

  @ManyToOne(() => User, { nullable: true })
  reviewedBy?: User;

  @Property({ nullable: true })
  invitationToken?: string;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date = new Date();

  @Property({ onUpdate: () => new Date(), nullable: true })
  updatedAt?: Date;
}
