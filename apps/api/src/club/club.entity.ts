import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';

import type { ClubLink } from './club-link.type';

export enum ClubVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

@Entity()
export class Club {
  @PrimaryKey()
  id: string = uuid();

  @Property()
  name: string;

  /** Short code for score cards etc., e.g. "KSP" for "Kyiv Sport Club" */
  @Property({ nullable: true })
  shortCode?: string;

  @Property({ nullable: true })
  description?: string;

  @Property({ nullable: true, length: 2 })
  country?: string;

  @Property({ nullable: true })
  city?: string;

  @Property({ nullable: true })
  clubLogo?: string;

  @Property({ default: ClubVisibility.PUBLIC })
  visibility: ClubVisibility = ClubVisibility.PUBLIC;

  @Property({ nullable: true })
  contactPerson?: string;

  @Property({ nullable: true })
  contactEmail?: string;

  @Property({ nullable: true })
  contactPhone?: string;

  @Property({ nullable: true })
  address?: string;

  @Property({ nullable: true, columnType: 'text' })
  otherInfo?: string;

  @Property({ type: 'json', nullable: true })
  links?: ClubLink[];

  @Property({ onCreate: () => new Date() })
  createdAt?: Date = new Date();

  @Property({ onUpdate: () => new Date(), nullable: true })
  updatedAt?: Date;
}
