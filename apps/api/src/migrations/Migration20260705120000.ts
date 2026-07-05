import { Migration } from '@mikro-orm/migrations';

export class Migration20260705120000 extends Migration {
  override async up(): Promise<void> {
    // 1. Create federation table
    this.addSql(
      `create table "federation" ("id" varchar(255) not null, "name" varchar(255) not null, "short_code" varchar(255) null, "country" varchar(2) null, "city" varchar(255) null, "description" text null, "logo" varchar(255) null, "visibility" varchar(255) not null default 'public', "created_at" timestamptz not null, "updated_at" timestamptz null, constraint "federation_pkey" primary key ("id"));`,
    );

    // 2. Add country, city, visibility to club
    this.addSql(
      `alter table "club" add column "country" varchar(2) null, add column "city" varchar(255) null, add column "visibility" varchar(255) not null default 'public';`,
    );

    // 3. Create club_membership table
    this.addSql(
      `create table "club_membership" ("id" varchar(255) not null, "club_id" varchar(255) not null, "user_id" varchar(255) not null, "status" varchar(255) not null default 'pending', "role" varchar(255) null, "is_custom" boolean not null default false, "custom_name" varchar(255) null, "invited_by_id" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz null, constraint "club_membership_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "club_membership" add constraint "club_membership_club_id_foreign" foreign key ("club_id") references "club" ("id") on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table "club_membership" add constraint "club_membership_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table "club_membership" add constraint "club_membership_invited_by_id_foreign" foreign key ("invited_by_id") references "user" ("id") on update cascade on delete set null;`,
    );
    this.addSql(
      `alter table "club_membership" add constraint "club_membership_club_user_unique" unique ("club_id", "user_id");`,
    );

    // 4. Create federation_membership table
    this.addSql(
      `create table "federation_membership" ("id" varchar(255) not null, "federation_id" varchar(255) not null, "club_id" varchar(255) not null, "status" varchar(255) not null default 'pending', "invited_by_id" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz null, constraint "federation_membership_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "federation_membership" add constraint "federation_membership_federation_id_foreign" foreign key ("federation_id") references "federation" ("id") on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table "federation_membership" add constraint "federation_membership_club_id_foreign" foreign key ("club_id") references "club" ("id") on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table "federation_membership" add constraint "federation_membership_invited_by_id_foreign" foreign key ("invited_by_id") references "user" ("id") on update cascade on delete set null;`,
    );
    this.addSql(
      `alter table "federation_membership" add constraint "federation_membership_federation_club_unique" unique ("federation_id", "club_id");`,
    );

    // 5. Create club_invitation table
    this.addSql(
      `create table "club_invitation" ("id" varchar(255) not null, "club_id" varchar(255) not null, "email" varchar(255) not null, "invited_by_id" varchar(255) not null, "token" varchar(255) not null, "status" varchar(255) not null default 'pending', "created_at" timestamptz not null, constraint "club_invitation_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "club_invitation" add constraint "club_invitation_club_id_foreign" foreign key ("club_id") references "club" ("id") on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table "club_invitation" add constraint "club_invitation_invited_by_id_foreign" foreign key ("invited_by_id") references "user" ("id") on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table "club_invitation" add constraint "club_invitation_token_unique" unique ("token");`,
    );

    // 6. Create federation_invitation table
    this.addSql(
      `create table "federation_invitation" ("id" varchar(255) not null, "federation_id" varchar(255) not null, "club_id" varchar(255) not null, "invited_by_id" varchar(255) not null, "token" varchar(255) not null, "status" varchar(255) not null default 'pending', "created_at" timestamptz not null, constraint "federation_invitation_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "federation_invitation" add constraint "federation_invitation_federation_id_foreign" foreign key ("federation_id") references "federation" ("id") on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table "federation_invitation" add constraint "federation_invitation_club_id_foreign" foreign key ("club_id") references "club" ("id") on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table "federation_invitation" add constraint "federation_invitation_invited_by_id_foreign" foreign key ("invited_by_id") references "user" ("id") on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table "federation_invitation" add constraint "federation_invitation_token_unique" unique ("token");`,
    );

    // 7. Migrate existing user.club_id → club_membership
    this.addSql(
      `insert into "club_membership" ("id", "club_id", "user_id", "status", "is_custom", "created_at")
       select cast(gen_random_uuid() as varchar), "club_id", "id", 'approved', false, now()
       from "user" where "club_id" is not null;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "federation_invitation";`);
    this.addSql(`drop table if exists "club_invitation";`);
    this.addSql(`drop table if exists "federation_membership";`);
    this.addSql(`drop table if exists "club_membership";`);
    this.addSql(
      `alter table "club" drop column "country", drop column "city", drop column "visibility";`,
    );
    this.addSql(`drop table if exists "federation";`);
  }
}
