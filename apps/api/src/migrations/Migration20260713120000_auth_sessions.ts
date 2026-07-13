import { Migration } from '@mikro-orm/migrations';

export class Migration20260713120000_auth_sessions extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "user" add column "google_id" varchar(255) null, add column "managed_federation_id" varchar(255) null;`,
    );
    this.addSql(`alter table "user" add constraint "user_google_id_unique" unique ("google_id");`);
    this.addSql(
      `alter table "user" add constraint "user_managed_federation_id_foreign" foreign key ("managed_federation_id") references "federation" ("id") on update cascade on delete set null;`,
    );

    this.addSql(
      `create table "auth_session" ("id" varchar(255) not null, "user_id" varchar(255) not null, "token_hash" varchar(255) not null, "expires_at" timestamptz not null, "revoked_at" timestamptz null, "user_agent" varchar(255) null, "ip_address" varchar(255) null, "created_at" timestamptz not null, constraint "auth_session_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "auth_session" add constraint "auth_session_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;`,
    );
    this.addSql(`create index "auth_session_token_hash_index" on "auth_session" ("token_hash");`);

    this.addSql(
      `create table "oauth_exchange_code" ("id" varchar(255) not null, "user_id" varchar(255) not null, "code_hash" varchar(255) not null, "expires_at" timestamptz not null, "used_at" timestamptz null, "created_at" timestamptz not null, constraint "oauth_exchange_code_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "oauth_exchange_code" add constraint "oauth_exchange_code_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;`,
    );
    this.addSql(
      `create index "oauth_exchange_code_code_hash_index" on "oauth_exchange_code" ("code_hash");`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "oauth_exchange_code";`);
    this.addSql(`drop table if exists "auth_session";`);
    this.addSql(
      `alter table "user" drop constraint if exists "user_managed_federation_id_foreign";`,
    );
    this.addSql(`alter table "user" drop constraint if exists "user_google_id_unique";`);
    this.addSql(`alter table "user" drop column "google_id", drop column "managed_federation_id";`);
  }
}
