import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import { User } from '../user/entity/user.entity';

@Entity({ tableName: 'push_subscription' })
export class PushSubscription {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne(() => User)
  user!: User;

  @Property({ type: 'text', unique: true })
  endpoint!: string;

  @Property()
  p256dh!: string;

  @Property()
  auth!: string;

  @Property({ type: 'text', nullable: true })
  userAgent?: string;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();
}
