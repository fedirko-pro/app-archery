import { Migration } from '@mikro-orm/migrations';

export class Migration20261026100000_user_notification_settings extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "user" add column "notify_new_tournaments" boolean not null default false;`,
    );
    this.addSql(
      `alter table "user" add column "notify_streak_reminder" boolean not null default false;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "user" drop column "notify_new_tournaments";`);
    this.addSql(`alter table "user" drop column "notify_streak_reminder";`);
  }
}
