import { Migration } from '@mikro-orm/migrations';

export class Migration20260708130000 extends Migration {
  override async up(): Promise<void> {
    // Convert draw_weight from free text (e.g. "40 lbs") to a numeric value in pounds.
    this.addSql(
      `alter table "equipment_set" alter column "draw_weight" type numeric using nullif(regexp_replace("draw_weight", '[^0-9.]', '', 'g'), '')::numeric;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "equipment_set" alter column "draw_weight" type varchar(255) using "draw_weight"::varchar;`,
    );
  }
}
