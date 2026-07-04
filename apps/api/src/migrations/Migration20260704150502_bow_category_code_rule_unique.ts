import { Migration } from '@mikro-orm/migrations';

export class Migration20260704150502_bow_category_code_rule_unique extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "tournament_feedback" drop constraint "tournament_feedback_tournament_id_foreign";`,
    );
    this.addSql(
      `alter table "tournament_feedback" drop constraint "tournament_feedback_user_id_foreign";`,
    );

    this.addSql(`alter table "bow_category" drop constraint "bow_category_code_unique";`);

    this.addSql(
      `alter table "bow_category" add constraint "bow_category_code_rule_id_unique" unique ("code", "rule_id");`,
    );

    this.addSql(
      `alter table "user" alter column "profile_visibility" type varchar(255) using ("profile_visibility"::varchar(255));`,
    );

    this.addSql(`drop index "tournament_feedback_tournament_id_index";`);

    this.addSql(
      `alter table "tournament_feedback" add constraint "tournament_feedback_tournament_id_foreign" foreign key ("tournament_id") references "tournament" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "tournament_feedback" add constraint "tournament_feedback_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "tournament_feedback" drop constraint "tournament_feedback_tournament_id_foreign";`,
    );
    this.addSql(
      `alter table "tournament_feedback" drop constraint "tournament_feedback_user_id_foreign";`,
    );

    this.addSql(`alter table "bow_category" drop constraint "bow_category_code_rule_id_unique";`);

    this.addSql(
      `alter table "bow_category" add constraint "bow_category_code_unique" unique ("code");`,
    );

    this.addSql(
      `alter table "tournament_feedback" add constraint "tournament_feedback_tournament_id_foreign" foreign key ("tournament_id") references "tournament" ("id") on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table "tournament_feedback" add constraint "tournament_feedback_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;`,
    );
    this.addSql(
      `create index "tournament_feedback_tournament_id_index" on "tournament_feedback" ("tournament_id");`,
    );

    this.addSql(
      `alter table "user" alter column "profile_visibility" type text using ("profile_visibility"::text);`,
    );
  }
}
