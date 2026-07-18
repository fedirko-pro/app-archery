import { Migration } from '@mikro-orm/migrations';

export class Migration20260717210000_tournament_defaults extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "tournament" alter column "allow_multiple_applications" set default false;`,
    );
    this.addSql(`alter table "tournament" alter column "collect_feedback" set default true;`);
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "tournament" alter column "allow_multiple_applications" set default true;`,
    );
    this.addSql(`alter table "tournament" alter column "collect_feedback" set default false;`);
  }
}
