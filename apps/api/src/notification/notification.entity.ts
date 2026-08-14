import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import { User } from '../user/entity/user.entity';
import { NotificationBroadcast } from './announcement.entity';

@Entity({ tableName: 'notification' })
export class Notification {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne(() => User)
  user!: User;

  @Property()
  type!: string;

  @Property()
  titleKey!: string;

  @Property()
  bodyKey!: string;

  @Property({ type: 'json', nullable: true })
  params?: Record<string, unknown>;

  @Property({ nullable: true })
  link?: string;

  @Property({ default: false })
  important: boolean = false;

  @Property({ nullable: true })
  readAt?: Date;

  @ManyToOne(() => NotificationBroadcast, { nullable: true })
  broadcast?: NotificationBroadcast;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();
}
