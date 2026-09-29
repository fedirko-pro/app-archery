import { Migration } from '@mikro-orm/migrations';

export class Migration20260929140000_push_subscriptions extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "push_subscription" ("id" varchar(255) not null, "user_id" varchar(255) not null, "endpoint" text not null, "p256dh" varchar(255) not null, "auth" varchar(255) not null, "user_agent" text null, "created_at" timestamptz not null, constraint "push_subscription_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "push_subscription" add constraint "push_subscription_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;`,
    );
    this.addSql(
      `create unique index "push_subscription_endpoint_unique" on "push_subscription" ("endpoint");`,
    );
    this.addSql(
      `create index "push_subscription_user_id_index" on "push_subscription" ("user_id");`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "push_subscription";`);
  }
}
