import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import { User } from '../user/entity/user.entity';
import { Patrol } from './patrol.entity';

export enum PatrolRole {
  LEADER = 'leader',
  MEMBER = 'member',
  JUDGE = 'judge',
}

@Entity()
export class PatrolMember {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne(() => Patrol)
  patrol: Patrol;

  @ManyToOne(() => User)
  user: User;

  @Property({ type: 'string' })
  role: PatrolRole;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date(), nullable: true })
  updatedAt?: Date;
}
