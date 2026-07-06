import { Migration } from '@mikro-orm/migrations';

export class Migration20260706160000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "user_achievement" (
        "id" varchar(255) not null,
        "user_id" varchar(255) not null,
        "achievement_id" varchar(255) not null,
        "source" varchar(255) not null default 'computed',
        "metadata" jsonb null,
        "earned_at" timestamptz not null,
        constraint "user_achievement_pkey" primary key ("id")
      );`,
    );
    this.addSql(
      `alter table "user_achievement" add constraint "user_achievement_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table "user_achievement" add constraint "user_achievement_user_achievement_unique" unique ("user_id", "achievement_id");`,
    );
    this.addSql(`create index "user_achievement_user_id_index" on "user_achievement" ("user_id");`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "user_achievement";`);
  }
}
