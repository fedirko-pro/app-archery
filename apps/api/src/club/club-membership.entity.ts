import { Entity, PrimaryKey, Property, ManyToOne, Unique } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import { Club } from './club.entity';
import { User } from '../user/entity/user.entity';

export enum ClubMembershipStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum ClubMembershipRole {
  MEMBER = 'member',
  ADMIN = 'admin',
}

@Entity()
@Unique({ properties: ['club', 'user'], name: 'club_membership_club_user_unique' })
export class ClubMembership {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne(() => Club)
  club: Club;

  @ManyToOne(() => User)
  user: User;

  @Property({ type: 'string' })
  status: ClubMembershipStatus = ClubMembershipStatus.PENDING;

  @Property({ nullable: true, type: 'string' })
  role?: ClubMembershipRole;

  @Property({ default: false })
  isCustom: boolean = false;

  @Property({ nullable: true })
  customName?: string;

  @ManyToOne(() => User, { nullable: true })
  invitedBy?: User;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date = new Date();

  @Property({ onUpdate: () => new Date(), nullable: true })
  updatedAt?: Date;
}
