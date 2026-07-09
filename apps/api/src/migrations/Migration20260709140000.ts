import { Migration } from '@mikro-orm/migrations';

export class Migration20260709140000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "club" add column "contact_person" varchar(255) null, add column "contact_email" varchar(255) null, add column "contact_phone" varchar(255) null, add column "address" varchar(255) null, add column "other_info" text null, add column "links" jsonb null;`,
    );

    this.addSql(
      `create table "club_join_request" ("id" varchar(255) not null, "club_id" varchar(255) not null, "name" varchar(255) not null, "email" varchar(255) not null, "message" text null, "status" varchar(255) not null default 'pending', "user_id" varchar(255) null, "reviewed_by_id" varchar(255) null, "invitation_token" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz null, constraint "club_join_request_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "club_join_request" add constraint "club_join_request_club_id_foreign" foreign key ("club_id") references "club" ("id") on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table "club_join_request" add constraint "club_join_request_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete set null;`,
    );
    this.addSql(
      `alter table "club_join_request" add constraint "club_join_request_reviewed_by_id_foreign" foreign key ("reviewed_by_id") references "user" ("id") on update cascade on delete set null;`,
    );
    this.addSql(
      `create unique index "club_join_request_club_email_pending_unique" on "club_join_request" ("club_id", "email") where "status" = 'pending';`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "club_join_request";`);
    this.addSql(
      `alter table "club" drop column "contact_person", drop column "contact_email", drop column "contact_phone", drop column "address", drop column "other_info", drop column "links";`,
    );
  }
}
