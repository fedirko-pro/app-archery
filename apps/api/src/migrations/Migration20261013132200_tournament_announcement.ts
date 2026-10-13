import { Migration } from '@mikro-orm/migrations';

export class Migration20261013132200_tournament_announcement extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "tournament" add column "announcement" boolean not null default false;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "tournament" drop column "announcement";`);
  }
}
