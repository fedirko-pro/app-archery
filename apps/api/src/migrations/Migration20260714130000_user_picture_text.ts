import { Migration } from '@mikro-orm/migrations';

export class Migration20260714130000_user_picture_text extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table "user" alter column "picture" type text using "picture"::text;`);
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "user" alter column "picture" type varchar(255) using "picture"::varchar(255);`,
    );
  }
}
