import { Migration } from '@mikro-orm/migrations';

export class Migration20260704130000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "rule" add column "sort_order" int not null default 0;`,
    );
    this.addSql(`update "rule" set "sort_order" = 1 where "rule_code" = 'FABP';`);
    this.addSql(`update "rule" set "sort_order" = 2 where "rule_code" = 'FPTA';`);
    this.addSql(`update "rule" set "sort_order" = 3 where "rule_code" = 'IFAA';`);
    this.addSql(`update "rule" set "sort_order" = 4 where "rule_code" = 'IFAA-HB';`);
    this.addSql(`update "rule" set "sort_order" = 5 where "rule_code" = 'HDH-IAA';`);
    this.addSql(`update "rule" set "sort_order" = 6 where "rule_code" = 'WA';`);
    this.addSql(`update "rule" set "sort_order" = 7 where "rule_code" = 'WA-INDOOR';`);
    this.addSql(`update "rule" set "sort_order" = 8 where "rule_code" = 'NFAA';`);
    this.addSql(`update "rule" set "sort_order" = 9 where "rule_code" = 'IBO';`);
    this.addSql(`update "rule" set "sort_order" = 10 where "rule_code" = 'FITARCO';`);
    this.addSql(`update "rule" set "sort_order" = 11 where "rule_code" = 'RFETA';`);
    this.addSql(`update "rule" set "sort_order" = 12 where "rule_code" = 'FSLU';`);
    this.addSql(`update "rule" set "sort_order" = 13 where "rule_code" = 'AGB';`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "rule" drop column "sort_order";`);
  }
}
