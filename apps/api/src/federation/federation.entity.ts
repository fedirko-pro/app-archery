import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';

export enum FederationVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

@Entity()
export class Federation {
  @PrimaryKey()
  id: string = uuid();

  @Property()
  name: string;

  @Property({ nullable: true })
  shortCode?: string;

  @Property({ nullable: true, length: 2 })
  country?: string;

  @Property({ nullable: true })
  city?: string;

  @Property({ nullable: true })
  description?: string;

  @Property({ nullable: true })
  logo?: string;

  @Property({ default: FederationVisibility.PUBLIC })
  visibility: FederationVisibility = FederationVisibility.PUBLIC;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date = new Date();

  @Property({ onUpdate: () => new Date(), nullable: true })
  updatedAt?: Date;
}
