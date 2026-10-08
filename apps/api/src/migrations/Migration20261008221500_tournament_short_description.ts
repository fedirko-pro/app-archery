import { Migration } from '@mikro-orm/migrations';

export class Migration20261008221500_tournament_short_description extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table "tournament" add column "short_description" varchar(280) null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "tournament" drop column "short_description";`);
  }
}
