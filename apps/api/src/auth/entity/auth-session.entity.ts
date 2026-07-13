import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import { User } from '../../user/entity/user.entity';

@Entity()
export class AuthSession {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne(() => User)
  user!: User;

  @Property({ hidden: true })
  tokenHash!: string;

  @Property()
  expiresAt!: Date;

  @Property({ nullable: true })
  revokedAt?: Date;

  @Property({ nullable: true })
  userAgent?: string;

  @Property({ nullable: true })
  ipAddress?: string;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();
}
