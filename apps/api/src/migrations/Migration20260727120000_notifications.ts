import { Migration } from '@mikro-orm/migrations';

export class Migration20260727120000_notifications extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "notification" ("id" varchar(255) not null, "user_id" varchar(255) not null, "type" varchar(255) not null, "title_key" varchar(255) not null, "body_key" varchar(255) not null, "params" jsonb null, "link" varchar(255) null, "important" boolean not null default false, "read_at" timestamptz null, "created_at" timestamptz not null, constraint "notification_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "notification" add constraint "notification_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;`,
    );
    this.addSql(
      `create index "notification_user_created_index" on "notification" ("user_id", "created_at" desc);`,
    );
    this.addSql(
      `create index "notification_user_important_read_index" on "notification" ("user_id", "important", "read_at");`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "notification";`);
  }
}
