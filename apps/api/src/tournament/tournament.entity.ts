import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { TOURNAMENT_SHORT_DESCRIPTION_MAX_LENGTH } from '@sokil/shared-types';
import { v4 as uuid } from 'uuid';
import { Rule } from '../rule/rule.entity';
import { User } from '../user/entity/user.entity';

@Entity()
export class Tournament {
  @PrimaryKey()
  id: string = uuid();

  @Property()
  title: string;

  @Property({ nullable: true, columnType: 'text' })
  description?: string;

  @Property({ nullable: true, length: TOURNAMENT_SHORT_DESCRIPTION_MAX_LENGTH })
  shortDescription?: string | null;

  @Property({ nullable: true })
  address?: string;

  @Property({ nullable: true, length: 2 })
  country?: string;

  @Property({ nullable: true, type: 'json' })
  locationCoords?: { lat: number; lng: number };

  @Property()
  startDate: Date;

  @Property({ nullable: true })
  endDate?: Date;

  @Property({ nullable: true })
  applicationDeadline?: Date;

  @Property({ default: false })
  allowMultipleApplications: boolean = false;

  @Property({ default: true })
  collectFeedback: boolean = true;

  @Property({ default: 18 })
  targetCount: number = 18; // Number of targets/patrols

  @Property({ nullable: true })
  banner?: string;

  @Property({ type: 'json', nullable: true })
  attachments?: Array<{
    id: string;
    url: string;
    filename: string;
    size: number;
    mimeType: string;
    uploadedAt: Date;
  }>;

  @ManyToOne(() => User)
  createdBy: User;

  @ManyToOne(() => Rule, { nullable: true })
  rule?: Rule;

  // @OneToMany(() => Patrol, (patrol) => patrol.tournament)
  // patrols = [];

  @Property({ onCreate: () => new Date() })
  createdAt?: Date = new Date();

  @Property({ onUpdate: () => new Date(), nullable: true })
  updatedAt?: Date;
}
