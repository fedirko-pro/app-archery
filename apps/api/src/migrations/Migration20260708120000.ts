import { Migration } from '@mikro-orm/migrations';

export class Migration20260708120000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table "rule" add column "description_de" text null;`);
    this.addSql(`alter table "bow_category" add column "description_de" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "rule" drop column "description_de";`);
    this.addSql(`alter table "bow_category" drop column "description_de";`);
  }
}
