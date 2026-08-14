import { Migration } from '@mikro-orm/migrations';

export class Migration20260814120000_announcements extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "notification_broadcast" ("id" varchar(255) not null, "sender_id" varchar(255) not null, "audience_type" varchar(255) not null, "title" varchar(255) null, "message" text not null, "link" varchar(255) null, "tournament_id" varchar(255) null, "tournament_title" varchar(255) null, "recipient_count" int not null default 0, "created_at" timestamptz not null, constraint "notification_broadcast_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "notification_broadcast" add constraint "notification_broadcast_sender_id_foreign" foreign key ("sender_id") references "user" ("id") on update cascade on delete cascade;`,
    );
    this.addSql(
      `create index "notification_broadcast_sender_created_index" on "notification_broadcast" ("sender_id", "created_at" desc);`,
    );
    this.addSql(`alter table "notification" add column "broadcast_id" varchar(255) null;`);
    this.addSql(
      `alter table "notification" add constraint "notification_broadcast_id_foreign" foreign key ("broadcast_id") references "notification_broadcast" ("id") on update cascade on delete set null;`,
    );
    this.addSql(
      `create index "notification_broadcast_id_index" on "notification" ("broadcast_id");`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop index if exists "notification_broadcast_id_index";`);
    this.addSql(
      `alter table "notification" drop constraint if exists "notification_broadcast_id_foreign";`,
    );
    this.addSql(`alter table "notification" drop column if exists "broadcast_id";`);
    this.addSql(`drop table if exists "notification_broadcast";`);
  }
}
