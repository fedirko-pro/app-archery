import { Migration } from '@mikro-orm/migrations';

export class Migration20261008190000_tournament_description_text extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "tournament" alter column "description" type text using "description"::text;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "tournament" alter column "description" type varchar(255) using "description"::varchar(255);`,
    );
  }
}
