import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import { User } from '../../user/entity/user.entity';

@Entity()
export class OAuthExchangeCode {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne(() => User)
  user!: User;

  @Property({ hidden: true })
  codeHash!: string;

  @Property()
  expiresAt!: Date;

  @Property({ nullable: true })
  usedAt?: Date;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();
}
