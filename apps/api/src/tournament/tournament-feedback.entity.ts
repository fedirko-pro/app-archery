import { Entity, ManyToOne, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import { User } from '../user/entity/user.entity';
import { Tournament } from './tournament.entity';

@Entity()
@Unique({ properties: ['tournament', 'user'] })
export class TournamentFeedback {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne(() => Tournament)
  tournament: Tournament;

  @ManyToOne(() => User)
  user: User;

  @Property({ type: 'smallint' })
  rating: number;

  @Property({ nullable: true, length: 2000 })
  comment?: string;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();
}
