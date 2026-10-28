import { Migration } from '@mikro-orm/migrations';

export class Migration20261028100000_user_app_updates_setting extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "user" add column "notify_app_updates" boolean not null default false;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "user" drop column "notify_app_updates";`);
  }
}
