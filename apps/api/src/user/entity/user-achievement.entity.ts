import { Entity, PrimaryKey, Property, ManyToOne, Unique } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import { User } from './user.entity';

export type UserAchievementSource = 'computed' | 'granted';

@Entity()
@Unique({ properties: ['user', 'achievementId'] })
export class UserAchievement {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne(() => User)
  user!: User;

  @Property()
  achievementId!: string;

  @Property({ default: 'computed' })
  source: UserAchievementSource = 'computed';

  @Property({ type: 'json', nullable: true })
  metadata?: Record<string, unknown>;

  @Property({ onCreate: () => new Date() })
  earnedAt: Date = new Date();
}
