import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import { User } from '../user/entity/user.entity';

@Entity({ tableName: 'notification_broadcast' })
export class NotificationBroadcast {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne(() => User)
  sender!: User;

  @Property()
  audienceType!: string;

  @Property({ nullable: true })
  title?: string;

  @Property({ type: 'text' })
  message!: string;

  @Property({ nullable: true })
  link?: string;

  @Property({ nullable: true })
  tournamentId?: string;

  @Property({ nullable: true })
  tournamentTitle?: string;

  @Property()
  recipientCount: number = 0;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();
}
