import { Migration } from '@mikro-orm/migrations';

export class Migration20261001230000_rulebook_divisions_and_categories extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Cub Male', 'Boys under 13', r."id", now() from "rule" r where r."rule_code" = 'IFAA' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Cub Male');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Boys under 13', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA' and d."name" = 'Cub Male' and d."description" is distinct from 'Boys under 13';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Cub Female', 'Girls under 13', r."id", now() from "rule" r where r."rule_code" = 'IFAA' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Cub Female');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Girls under 13', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA' and d."name" = 'Cub Female' and d."description" is distinct from 'Girls under 13';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Junior Male', 'Boys 13-16', r."id", now() from "rule" r where r."rule_code" = 'IFAA' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Junior Male');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Boys 13-16', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA' and d."name" = 'Junior Male' and d."description" is distinct from 'Boys 13-16';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Junior Female', 'Girls 13-16', r."id", now() from "rule" r where r."rule_code" = 'IFAA' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Junior Female');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Girls 13-16', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA' and d."name" = 'Junior Female' and d."description" is distinct from 'Girls 13-16';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Young Adult Male', 'Men 17-20', r."id", now() from "rule" r where r."rule_code" = 'IFAA' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Young Adult Male');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Men 17-20', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA' and d."name" = 'Young Adult Male' and d."description" is distinct from 'Men 17-20';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Young Adult Female', 'Women 17-20', r."id", now() from "rule" r where r."rule_code" = 'IFAA' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Young Adult Female');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Women 17-20', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA' and d."name" = 'Young Adult Female' and d."description" is distinct from 'Women 17-20';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Adult Male', 'Men 21-54', r."id", now() from "rule" r where r."rule_code" = 'IFAA' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Adult Male');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Men 21-54', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA' and d."name" = 'Adult Male' and d."description" is distinct from 'Men 21-54';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Adult Female', 'Women 21-54', r."id", now() from "rule" r where r."rule_code" = 'IFAA' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Adult Female');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Women 21-54', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA' and d."name" = 'Adult Female' and d."description" is distinct from 'Women 21-54';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Veteran Male', 'Men 55 and over (optional; may shoot Adult instead)', r."id", now() from "rule" r where r."rule_code" = 'IFAA' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Veteran Male');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Men 55 and over (optional; may shoot Adult instead)', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA' and d."name" = 'Veteran Male' and d."description" is distinct from 'Men 55 and over (optional; may shoot Adult instead)';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Veteran Female', 'Women 55 and over (optional; may shoot Adult instead)', r."id", now() from "rule" r where r."rule_code" = 'IFAA' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Veteran Female');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Women 55 and over (optional; may shoot Adult instead)', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA' and d."name" = 'Veteran Female' and d."description" is distinct from 'Women 55 and over (optional; may shoot Adult instead)';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Senior Male', 'Men 65 and over (optional; may shoot Veteran or Adult instead)', r."id", now() from "rule" r where r."rule_code" = 'IFAA' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Senior Male');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Men 65 and over (optional; may shoot Veteran or Adult instead)', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA' and d."name" = 'Senior Male' and d."description" is distinct from 'Men 65 and over (optional; may shoot Veteran or Adult instead)';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Senior Female', 'Women 65 and over (optional; may shoot Veteran or Adult instead)', r."id", now() from "rule" r where r."rule_code" = 'IFAA' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Senior Female');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Women 65 and over (optional; may shoot Veteran or Adult instead)', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA' and d."name" = 'Senior Female' and d."description" is distinct from 'Women 65 and over (optional; may shoot Veteran or Adult instead)';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Cub Male', 'Boys under 13', r."id", now() from "rule" r where r."rule_code" = 'IFAA-HB' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Cub Male');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Boys under 13', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA-HB' and d."name" = 'Cub Male' and d."description" is distinct from 'Boys under 13';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Cub Female', 'Girls under 13', r."id", now() from "rule" r where r."rule_code" = 'IFAA-HB' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Cub Female');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Girls under 13', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA-HB' and d."name" = 'Cub Female' and d."description" is distinct from 'Girls under 13';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Junior Male', 'Boys 13-16', r."id", now() from "rule" r where r."rule_code" = 'IFAA-HB' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Junior Male');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Boys 13-16', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA-HB' and d."name" = 'Junior Male' and d."description" is distinct from 'Boys 13-16';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Junior Female', 'Girls 13-16', r."id", now() from "rule" r where r."rule_code" = 'IFAA-HB' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Junior Female');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Girls 13-16', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA-HB' and d."name" = 'Junior Female' and d."description" is distinct from 'Girls 13-16';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Young Adult Male', 'Men 17-20', r."id", now() from "rule" r where r."rule_code" = 'IFAA-HB' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Young Adult Male');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Men 17-20', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA-HB' and d."name" = 'Young Adult Male' and d."description" is distinct from 'Men 17-20';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Young Adult Female', 'Women 17-20', r."id", now() from "rule" r where r."rule_code" = 'IFAA-HB' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Young Adult Female');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Women 17-20', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA-HB' and d."name" = 'Young Adult Female' and d."description" is distinct from 'Women 17-20';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Adult Male', 'Men 21-54', r."id", now() from "rule" r where r."rule_code" = 'IFAA-HB' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Adult Male');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Men 21-54', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA-HB' and d."name" = 'Adult Male' and d."description" is distinct from 'Men 21-54';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Adult Female', 'Women 21-54', r."id", now() from "rule" r where r."rule_code" = 'IFAA-HB' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Adult Female');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Women 21-54', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA-HB' and d."name" = 'Adult Female' and d."description" is distinct from 'Women 21-54';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Veteran Male', 'Men 55 and over (optional; may shoot Adult instead)', r."id", now() from "rule" r where r."rule_code" = 'IFAA-HB' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Veteran Male');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Men 55 and over (optional; may shoot Adult instead)', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA-HB' and d."name" = 'Veteran Male' and d."description" is distinct from 'Men 55 and over (optional; may shoot Adult instead)';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Veteran Female', 'Women 55 and over (optional; may shoot Adult instead)', r."id", now() from "rule" r where r."rule_code" = 'IFAA-HB' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Veteran Female');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Women 55 and over (optional; may shoot Adult instead)', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA-HB' and d."name" = 'Veteran Female' and d."description" is distinct from 'Women 55 and over (optional; may shoot Adult instead)';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Senior Male', 'Men 65 and over (optional; may shoot Veteran or Adult instead)', r."id", now() from "rule" r where r."rule_code" = 'IFAA-HB' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Senior Male');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Men 65 and over (optional; may shoot Veteran or Adult instead)', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA-HB' and d."name" = 'Senior Male' and d."description" is distinct from 'Men 65 and over (optional; may shoot Veteran or Adult instead)';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Senior Female', 'Women 65 and over (optional; may shoot Veteran or Adult instead)', r."id", now() from "rule" r where r."rule_code" = 'IFAA-HB' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Senior Female');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Women 65 and over (optional; may shoot Veteran or Adult instead)', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA-HB' and d."name" = 'Senior Female' and d."description" is distinct from 'Women 65 and over (optional; may shoot Veteran or Adult instead)';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Cub Male', 'Boys under 13', r."id", now() from "rule" r where r."rule_code" = 'FABP' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Cub Male');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Boys under 13', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FABP' and d."name" = 'Cub Male' and d."description" is distinct from 'Boys under 13';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Cub Female', 'Girls under 13', r."id", now() from "rule" r where r."rule_code" = 'FABP' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Cub Female');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Girls under 13', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FABP' and d."name" = 'Cub Female' and d."description" is distinct from 'Girls under 13';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Junior Male', 'Boys 13-16', r."id", now() from "rule" r where r."rule_code" = 'FABP' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Junior Male');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Boys 13-16', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FABP' and d."name" = 'Junior Male' and d."description" is distinct from 'Boys 13-16';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Junior Female', 'Girls 13-16', r."id", now() from "rule" r where r."rule_code" = 'FABP' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Junior Female');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Girls 13-16', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FABP' and d."name" = 'Junior Female' and d."description" is distinct from 'Girls 13-16';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Young Adult Male', 'Men 18-20 (suspended at national events)', r."id", now() from "rule" r where r."rule_code" = 'FABP' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Young Adult Male');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Men 18-20 (suspended at national events)', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FABP' and d."name" = 'Young Adult Male' and d."description" is distinct from 'Men 18-20 (suspended at national events)';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Young Adult Female', 'Women 18-20 (suspended at national events)', r."id", now() from "rule" r where r."rule_code" = 'FABP' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Young Adult Female');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Women 18-20 (suspended at national events)', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FABP' and d."name" = 'Young Adult Female' and d."description" is distinct from 'Women 18-20 (suspended at national events)';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Adult Male', 'Men 21-54 (17 and over may shoot Adult)', r."id", now() from "rule" r where r."rule_code" = 'FABP' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Adult Male');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Men 21-54 (17 and over may shoot Adult)', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FABP' and d."name" = 'Adult Male' and d."description" is distinct from 'Men 21-54 (17 and over may shoot Adult)';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Adult Female', 'Women 21-54 (17 and over may shoot Adult)', r."id", now() from "rule" r where r."rule_code" = 'FABP' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Adult Female');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Women 21-54 (17 and over may shoot Adult)', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FABP' and d."name" = 'Adult Female' and d."description" is distinct from 'Women 21-54 (17 and over may shoot Adult)';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Veteran Male', 'Men 55-64 (optional)', r."id", now() from "rule" r where r."rule_code" = 'FABP' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Veteran Male');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Men 55-64 (optional)', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FABP' and d."name" = 'Veteran Male' and d."description" is distinct from 'Men 55-64 (optional)';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Veteran Female', 'Women 55-64 (optional)', r."id", now() from "rule" r where r."rule_code" = 'FABP' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Veteran Female');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Women 55-64 (optional)', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FABP' and d."name" = 'Veteran Female' and d."description" is distinct from 'Women 55-64 (optional)';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Senior Male', 'Men 65 and over (optional; suspended at national events)', r."id", now() from "rule" r where r."rule_code" = 'FABP' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Senior Male');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Men 65 and over (optional; suspended at national events)', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FABP' and d."name" = 'Senior Male' and d."description" is distinct from 'Men 65 and over (optional; suspended at national events)';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Senior Female', 'Women 65 and over (optional; suspended at national events)', r."id", now() from "rule" r where r."rule_code" = 'FABP' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Senior Female');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Women 65 and over (optional; suspended at national events)', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FABP' and d."name" = 'Senior Female' and d."description" is distinct from 'Women 65 and over (optional; suspended at national events)';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Mini Male', 'Boys 10-12 (optional)', r."id", now() from "rule" r where r."rule_code" = 'HDH-IAA' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Mini Male');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Boys 10-12 (optional)', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'HDH-IAA' and d."name" = 'Mini Male' and d."description" is distinct from 'Boys 10-12 (optional)';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Mini Female', 'Girls 10-12 (optional)', r."id", now() from "rule" r where r."rule_code" = 'HDH-IAA' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Mini Female');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Girls 10-12 (optional)', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'HDH-IAA' and d."name" = 'Mini Female' and d."description" is distinct from 'Girls 10-12 (optional)';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Cadet Male', 'Boys 13-14 (optional)', r."id", now() from "rule" r where r."rule_code" = 'HDH-IAA' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Cadet Male');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Boys 13-14 (optional)', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'HDH-IAA' and d."name" = 'Cadet Male' and d."description" is distinct from 'Boys 13-14 (optional)';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Cadet Female', 'Girls 13-14 (optional)', r."id", now() from "rule" r where r."rule_code" = 'HDH-IAA' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Cadet Female');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Girls 13-14 (optional)', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'HDH-IAA' and d."name" = 'Cadet Female' and d."description" is distinct from 'Girls 13-14 (optional)';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Junior Male', 'Men 15-20', r."id", now() from "rule" r where r."rule_code" = 'HDH-IAA' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Junior Male');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Men 15-20', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'HDH-IAA' and d."name" = 'Junior Male' and d."description" is distinct from 'Men 15-20';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Junior Female', 'Women 15-20', r."id", now() from "rule" r where r."rule_code" = 'HDH-IAA' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Junior Female');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Women 15-20', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'HDH-IAA' and d."name" = 'Junior Female' and d."description" is distinct from 'Women 15-20';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Young Adult Male', 'Men 18-20 (optional split from Junior)', r."id", now() from "rule" r where r."rule_code" = 'HDH-IAA' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Young Adult Male');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Men 18-20 (optional split from Junior)', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'HDH-IAA' and d."name" = 'Young Adult Male' and d."description" is distinct from 'Men 18-20 (optional split from Junior)';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Young Adult Female', 'Women 18-20 (optional split from Junior)', r."id", now() from "rule" r where r."rule_code" = 'HDH-IAA' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Young Adult Female');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Women 18-20 (optional split from Junior)', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'HDH-IAA' and d."name" = 'Young Adult Female' and d."description" is distinct from 'Women 18-20 (optional split from Junior)';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Adult Male', 'Men 21-50', r."id", now() from "rule" r where r."rule_code" = 'HDH-IAA' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Adult Male');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Men 21-50', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'HDH-IAA' and d."name" = 'Adult Male' and d."description" is distinct from 'Men 21-50';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Adult Female', 'Women 21-50', r."id", now() from "rule" r where r."rule_code" = 'HDH-IAA' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Adult Female');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Women 21-50', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'HDH-IAA' and d."name" = 'Adult Female' and d."description" is distinct from 'Women 21-50';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Veteran Male', 'Men 55 and over', r."id", now() from "rule" r where r."rule_code" = 'HDH-IAA' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Veteran Male');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Men 55 and over', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'HDH-IAA' and d."name" = 'Veteran Male' and d."description" is distinct from 'Men 55 and over';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Veteran Female', 'Women 55 and over', r."id", now() from "rule" r where r."rule_code" = 'HDH-IAA' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Veteran Female');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Women 55 and over', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'HDH-IAA' and d."name" = 'Veteran Female' and d."description" is distinct from 'Women 55 and over';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Flechas Male', 'Boys under 9', r."id", now() from "rule" r where r."rule_code" = 'FPTA' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Flechas Male');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Boys under 9', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FPTA' and d."name" = 'Flechas Male' and d."description" is distinct from 'Boys under 9';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Flechas Female', 'Girls under 9', r."id", now() from "rule" r where r."rule_code" = 'FPTA' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Flechas Female');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Girls under 9', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FPTA' and d."name" = 'Flechas Female' and d."description" is distinct from 'Girls under 9';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Robins Male', 'Boys 9-11', r."id", now() from "rule" r where r."rule_code" = 'FPTA' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Robins Male');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Boys 9-11', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FPTA' and d."name" = 'Robins Male' and d."description" is distinct from 'Boys 9-11';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Robins Female', 'Girls 9-11', r."id", now() from "rule" r where r."rule_code" = 'FPTA' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Robins Female');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Girls 9-11', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FPTA' and d."name" = 'Robins Female' and d."description" is distinct from 'Girls 9-11';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Juvenis Male', 'Boys 12-14', r."id", now() from "rule" r where r."rule_code" = 'FPTA' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Juvenis Male');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Boys 12-14', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FPTA' and d."name" = 'Juvenis Male' and d."description" is distinct from 'Boys 12-14';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Juvenis Female', 'Girls 12-14', r."id", now() from "rule" r where r."rule_code" = 'FPTA' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Juvenis Female');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Girls 12-14', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FPTA' and d."name" = 'Juvenis Female' and d."description" is distinct from 'Girls 12-14';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Cadet Male', 'Men 15-17', r."id", now() from "rule" r where r."rule_code" = 'FPTA' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Cadet Male');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Men 15-17', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FPTA' and d."name" = 'Cadet Male' and d."description" is distinct from 'Men 15-17';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Cadet Female', 'Women 15-17', r."id", now() from "rule" r where r."rule_code" = 'FPTA' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Cadet Female');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Women 15-17', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FPTA' and d."name" = 'Cadet Female' and d."description" is distinct from 'Women 15-17';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Junior Male', 'Men 18-20', r."id", now() from "rule" r where r."rule_code" = 'FPTA' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Junior Male');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Men 18-20', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FPTA' and d."name" = 'Junior Male' and d."description" is distinct from 'Men 18-20';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Junior Female', 'Women 18-20', r."id", now() from "rule" r where r."rule_code" = 'FPTA' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Junior Female');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Women 18-20', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FPTA' and d."name" = 'Junior Female' and d."description" is distinct from 'Women 18-20';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Senior Male', 'Men 21 and over', r."id", now() from "rule" r where r."rule_code" = 'FPTA' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Senior Male');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Men 21 and over', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FPTA' and d."name" = 'Senior Male' and d."description" is distinct from 'Men 21 and over';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Senior Female', 'Women 21 and over', r."id", now() from "rule" r where r."rule_code" = 'FPTA' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Senior Female');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Women 21 and over', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FPTA' and d."name" = 'Senior Female' and d."description" is distinct from 'Women 21 and over';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Veteran Male', 'Men 50 and over (optional)', r."id", now() from "rule" r where r."rule_code" = 'FPTA' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Veteran Male');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Men 50 and over (optional)', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FPTA' and d."name" = 'Veteran Male' and d."description" is distinct from 'Men 50 and over (optional)';`,
    );
    this.addSql(
      `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, 'Veteran Female', 'Women 50 and over (optional)', r."id", now() from "rule" r where r."rule_code" = 'FPTA' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = 'Veteran Female');`,
    );
    this.addSql(
      `update "division" d set "description" = 'Women 50 and over (optional)', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FPTA' and d."name" = 'Veteran Female' and d."description" is distinct from 'Women 50 and over (optional)';`,
    );
    this.addSql(
      `insert into "bow_category" ("id", "code", "name", "description_en", "description_pt", "description_it", "description_uk", "description_es", "rule_reference", "rule_citation", "rule_id", "created_at") select gen_random_uuid()::varchar, 'HLB', 'Historical Longbow', 'English longbows, war bows, Victorian target bows, primitive bows and selfbows in natural materials only, modelled on bows that existed by 1900. No modern fibers, no shooting window. Wood or bamboo arrows with natural feathers; nocks of horn, bone, metal, wood, or self-nocks. Mediterranean draw.', 'Longbows ingleses, war bows, arcos vitorianos de alvo, arcos primitivos e selfbows só em materiais naturais, inspirados em arcos existentes até 1900. Sem fibras modernas e sem janela. Flechas de madeira ou bambu com penas naturais; nocks em corno, osso, metal, madeira ou self-nocks. Puxada mediterrânica.', 'Longbow inglesi, war bow, archi vittoriani da bersaglio, archi primitivi e selfbow solo in materiali naturali, sul modello di archi esistenti entro il 1900. Niente fibre moderne e niente finestra. Frecce in legno o bambù con piume naturali; cocche in corno, osso, metallo, legno o self-nock. Sgancio mediterraneo.', 'Англійські лонгбоу, war bow, вікторіанські мішеневі луки, примітивні та суцільні луки лише з природних матеріалів, за зразками до 1900 року. Без сучасних волокон і без вікна. Стріли з дерева або бамбука з натуральним оперенням; ноки з рогу, кістки, металу, дерева або self-nock. Середземноморський хват.', 'Longbows ingleses, war bows, arcos victorianos de diana, arcos primitivos y selfbows solo de materiales naturales, inspirados en arcos existentes hasta 1900. Sin fibras modernas y sin ventana. Flechas de madera o bambú con plumas naturales; culatines de cuerno, hueso, metal, madera o self-nock. Liberación mediterránea.', 'FABP QC2025, Art. 26 — Rota dos Castelos 1 (HLB)', 'Historical longbow for Rota dos Castelos', r."id", now() from "rule" r where r."rule_code" = 'FABP' and not exists (select 1 from "bow_category" c where c."rule_id" = r."id" and c."code" = 'HLB');`,
    );
    this.addSql(
      `insert into "bow_category" ("id", "code", "name", "description_en", "description_pt", "description_it", "description_uk", "description_es", "rule_reference", "rule_citation", "rule_id", "created_at") select gen_random_uuid()::varchar, 'MB-LB', 'Modern Longbow', 'American flatbow / modern longbow. Wood-based, one or two piece, usually laminated, with modern fibers such as fiberglass or carbon. Shooting window optional. Wood or bamboo arrows with natural feathers; non-fluorescent plastic nocks allowed.', 'American flatbow / longbow moderno. Base de madeira, uma ou duas peças, normalmente laminado, com fibras modernas (fibra de vidro ou carbono). Janela de disparo opcional. Flechas de madeira ou bambu com penas naturais; nocks de plástico não fluorescentes permitidos.', 'American flatbow / longbow moderno. Base in legno, uno o due pezzi, di solito laminato, con fibre moderne (vetroresina o carbonio). Finestra di tiro facoltativa. Frecce in legno o bambù con piume naturali; cocche in plastica non fluorescenti ammesse.', 'American flatbow / сучасний лонгбоу. Дерев’яна основа, одна або дві частини, зазвичай ламінований, із сучасними волокнами (склопластик або карбон). Вікно необов’язкове. Стріли з дерева або бамбука з натуральним оперенням; нефлуоресцентні пластикові ноки дозволені.', 'American flatbow / longbow moderno. Base de madera, de una o dos piezas, normalmente laminado, con fibras modernas (fibra de vidrio o carbono). Ventana de tiro opcional. Flechas de madera o bambú con plumas naturales; culatines de plástico no fluorescentes permitidos.', 'FABP QC2025, Art. 26 — Rota dos Castelos 3 (MB LB)', 'Modern longbow for Rota dos Castelos', r."id", now() from "rule" r where r."rule_code" = 'FABP' and not exists (select 1 from "bow_category" c where c."rule_id" = r."id" and c."code" = 'MB-LB');`,
    );
    this.addSql(
      `insert into "bow_category" ("id", "code", "name", "description_en", "description_pt", "description_it", "description_uk", "description_es", "rule_reference", "rule_citation", "rule_id", "created_at") select gen_random_uuid()::varchar, 'MB-TR', 'Modern Traditional Recurve', 'Traditional reflex-deflex recurve, one piece or two-piece takedown. Wood-based, modern fibers allowed. Shooting window optional. Wood or bamboo arrows with natural feathers; non-fluorescent plastic nocks allowed.', 'Recurvo tradicional reflexo-deflexo, uma peça ou take-down de duas peças. Base de madeira, fibras modernas permitidas. Janela de disparo opcional. Flechas de madeira ou bambu com penas naturais; nocks de plástico não fluorescentes permitidos.', 'Ricurvo tradizionale reflex-deflex, monopezzo o takedown in due pezzi. Base in legno, fibre moderne ammesse. Finestra di tiro facoltativa. Frecce in legno o bambù con piume naturali; cocche in plastica non fluorescenti ammesse.', 'Традиційний рекурсив reflex-deflex, суцільний або takedown із двох частин. Дерев’яна основа, сучасні волокна дозволені. Вікно необов’язкове. Стріли з дерева або бамбука з натуральним оперенням; нефлуоресцентні пластикові ноки дозволені.', 'Recurvo tradicional reflex-deflex, de una pieza o takedown de dos piezas. Base de madera, fibras modernas permitidas. Ventana de tiro opcional. Flechas de madera o bambú con plumas naturales; culatines de plástico no fluorescentes permitidos.', 'FABP QC2025, Art. 26 — Rota dos Castelos 4 (MB TR)', 'Modern traditional recurve for Rota dos Castelos', r."id", now() from "rule" r where r."rule_code" = 'FABP' and not exists (select 1 from "bow_category" c where c."rule_id" = r."id" and c."code" = 'MB-TR');`,
    );
    this.addSql(
      `insert into "bow_category" ("id", "code", "name", "description_en", "description_pt", "description_it", "description_uk", "description_es", "rule_reference", "rule_citation", "rule_id", "created_at") select gen_random_uuid()::varchar, 'MB-SB', 'Special Modern Recurve', 'Modern recurve, including three-piece takedown, with a wooden base. Wood or bamboo arrows with natural feathers; non-fluorescent plastic nocks allowed. For archers starting in Rota dos Castelos. Does not score for the individual or club championship.', 'Recurvo moderno, incluindo take-down de três peças, com base de madeira. Flechas de madeira ou bambu com penas naturais; nocks de plástico não fluorescentes permitidos. Para quem inicia na Rota dos Castelos. Não pontua para o campeonato individual nem para o de clubes.', 'Ricurvo moderno, incluso takedown in tre pezzi, con base in legno. Frecce in legno o bambù con piume naturali; cocche in plastica non fluorescenti ammesse. Per chi inizia nella Rota dos Castelos. Non assegna punti al campionato individuale né a quello di società.', 'Сучасний рекурсив, зокрема takedown із трьох частин, із дерев’яною основою. Стріли з дерева або бамбука з натуральним оперенням; нефлуоресцентні пластикові ноки дозволені. Для тих, хто починає в Rota dos Castelos. Не йде в залік особистого чемпіонату та чемпіонату клубів.', 'Recurvo moderno, incluido el takedown de tres piezas, con base de madera. Flechas de madera o bambú con plumas naturales; culatines de plástico no fluorescentes permitidos. Para quien empieza en la Rota dos Castelos. No puntúa para el campeonato individual ni para el de clubes.', 'FABP QC2025, Art. 26 — Rota dos Castelos 5 (MB SB)', 'Special modern recurve for Rota dos Castelos', r."id", now() from "rule" r where r."rule_code" = 'FABP' and not exists (select 1 from "bow_category" c where c."rule_id" = r."id" and c."code" = 'MB-SB');`,
    );
    this.addSql(
      `insert into "bow_category" ("id", "code", "name", "description_en", "description_pt", "description_it", "description_uk", "description_es", "rule_reference", "rule_citation", "rule_id", "created_at") select gen_random_uuid()::varchar, 'RC', 'Recurve', 'World Archery Recurve division. Sight, stabilisers, and a clicker are permitted.', 'Divisão Recurvo da World Archery. Mira, estabilizadores e clicker são permitidos.', 'Divisione Ricurvo World Archery. Mirino, stabilizzatori e clicker sono consentiti.', 'Дивізіон Recurve World Archery. Приціл, стабілізатори та клікер дозволені.', 'División Recurvo de World Archery. Se permiten mira, estabilizadores y clicker.', 'FPTA Quadros Competitivos (fev. 2026), Art. 5 — Recurvo, Compound e Barebow', 'Recurve division equipment', r."id", now() from "rule" r where r."rule_code" = 'FPTA' and not exists (select 1 from "bow_category" c where c."rule_id" = r."id" and c."code" = 'RC');`,
    );
    this.addSql(
      `insert into "bow_category" ("id", "code", "name", "description_en", "description_pt", "description_it", "description_uk", "description_es", "rule_reference", "rule_citation", "rule_id", "created_at") select gen_random_uuid()::varchar, 'CP', 'Compound', 'World Archery Compound division. Release aid, scope, and peep sight are permitted.', 'Divisão Compound da World Archery. Disparador, scope e peep sight são permitidos.', 'Divisione Compound World Archery. Sgancio meccanico, scope e peep sight sono consentiti.', 'Дивізіон Compound World Archery. Реліз, scope і peep sight дозволені.', 'División Compound de World Archery. Se permiten disparador, scope y peep sight.', 'FPTA Quadros Competitivos (fev. 2026), Art. 5 — Recurvo, Compound e Barebow', 'Compound division equipment', r."id", now() from "rule" r where r."rule_code" = 'FPTA' and not exists (select 1 from "bow_category" c where c."rule_id" = r."id" and c."code" = 'CP');`,
    );
    this.addSql(
      `insert into "bow_category" ("id", "code", "name", "description_en", "description_pt", "description_it", "description_uk", "description_es", "rule_reference", "rule_citation", "rule_id", "created_at") select gen_random_uuid()::varchar, 'BB', 'Barebow', 'World Archery Barebow division. Recurve equipment without a sight or stabilisers.', 'Divisão Barebow da World Archery. Equipamento de recurvo sem mira nem estabilizadores.', 'Divisione Barebow World Archery. Attrezzatura da ricurvo senza mirino né stabilizzatori.', 'Дивізіон Barebow World Archery. Рекурсивне спорядження без прицілу та стабілізаторів.', 'División Barebow de World Archery. Equipo de recurvo sin mira ni estabilizadores.', 'FPTA Quadros Competitivos (fev. 2026), Art. 5 — Recurvo, Compound e Barebow', 'Barebow division equipment', r."id", now() from "rule" r where r."rule_code" = 'FPTA' and not exists (select 1 from "bow_category" c where c."rule_id" = r."id" and c."code" = 'BB');`,
    );
    this.addSql(
      `insert into "bow_category" ("id", "code", "name", "description_en", "description_pt", "description_it", "description_uk", "description_es", "rule_reference", "rule_citation", "rule_id", "created_at") select gen_random_uuid()::varchar, 'RC', 'Recurve', 'World Archery Recurve division. Sight, stabilisers, and a clicker are permitted.', 'Divisão Recurvo da World Archery. Mira, estabilizadores e clicker são permitidos.', 'Divisione Ricurvo World Archery. Mirino, stabilizzatori e clicker sono consentiti.', 'Дивізіон Recurve World Archery. Приціл, стабілізатори та клікер дозволені.', 'División Recurvo de World Archery. Se permiten mira, estabilizadores y clicker.', 'World Archery Book 3 (2026), 9.1 — Recurve Division', 'Recurve division equipment', r."id", now() from "rule" r where r."rule_code" = 'WA' and not exists (select 1 from "bow_category" c where c."rule_id" = r."id" and c."code" = 'RC');`,
    );
    this.addSql(
      `insert into "bow_category" ("id", "code", "name", "description_en", "description_pt", "description_it", "description_uk", "description_es", "rule_reference", "rule_citation", "rule_id", "created_at") select gen_random_uuid()::varchar, 'CP', 'Compound', 'World Archery Compound division. Release aid, scope, and peep sight are permitted.', 'Divisão Compound da World Archery. Disparador, scope e peep sight são permitidos.', 'Divisione Compound World Archery. Sgancio meccanico, scope e peep sight sono consentiti.', 'Дивізіон Compound World Archery. Реліз, scope і peep sight дозволені.', 'División Compound de World Archery. Se permiten disparador, scope y peep sight.', 'World Archery Book 3 (2026), 9.2 — Compound Division', 'Compound division equipment', r."id", now() from "rule" r where r."rule_code" = 'WA' and not exists (select 1 from "bow_category" c where c."rule_id" = r."id" and c."code" = 'CP');`,
    );
    this.addSql(
      `insert into "bow_category" ("id", "code", "name", "description_en", "description_pt", "description_it", "description_uk", "description_es", "rule_reference", "rule_citation", "rule_id", "created_at") select gen_random_uuid()::varchar, 'BB', 'Barebow', 'World Archery Barebow division. Recurve equipment without a sight or stabilisers.', 'Divisão Barebow da World Archery. Equipamento de recurvo sem mira nem estabilizadores.', 'Divisione Barebow World Archery. Attrezzatura da ricurvo senza mirino né stabilizzatori.', 'Дивізіон Barebow World Archery. Рекурсивне спорядження без прицілу та стабілізаторів.', 'División Barebow de World Archery. Equipo de recurvo sin mira ni estabilizadores.', 'World Archery Book 3 (2026), 9.3 — Barebow Division', 'Barebow division equipment', r."id", now() from "rule" r where r."rule_code" = 'WA' and not exists (select 1 from "bow_category" c where c."rule_id" = r."id" and c."code" = 'BB');`,
    );
    this.addSql(
      `insert into "bow_category" ("id", "code", "name", "description_en", "description_pt", "description_it", "description_uk", "description_es", "rule_reference", "rule_citation", "rule_id", "created_at") select gen_random_uuid()::varchar, 'RC', 'Recurve', 'World Archery Recurve division. Sight, stabilisers, and a clicker are permitted.', 'Divisão Recurvo da World Archery. Mira, estabilizadores e clicker são permitidos.', 'Divisione Ricurvo World Archery. Mirino, stabilizzatori e clicker sono consentiti.', 'Дивізіон Recurve World Archery. Приціл, стабілізатори та клікер дозволені.', 'División Recurvo de World Archery. Se permiten mira, estabilizadores y clicker.', 'World Archery Book 3 (2026), 9.1 — Recurve Division', 'Recurve division equipment', r."id", now() from "rule" r where r."rule_code" = 'WA-INDOOR' and not exists (select 1 from "bow_category" c where c."rule_id" = r."id" and c."code" = 'RC');`,
    );
    this.addSql(
      `insert into "bow_category" ("id", "code", "name", "description_en", "description_pt", "description_it", "description_uk", "description_es", "rule_reference", "rule_citation", "rule_id", "created_at") select gen_random_uuid()::varchar, 'CP', 'Compound', 'World Archery Compound division. Release aid, scope, and peep sight are permitted.', 'Divisão Compound da World Archery. Disparador, scope e peep sight são permitidos.', 'Divisione Compound World Archery. Sgancio meccanico, scope e peep sight sono consentiti.', 'Дивізіон Compound World Archery. Реліз, scope і peep sight дозволені.', 'División Compound de World Archery. Se permiten disparador, scope y peep sight.', 'World Archery Book 3 (2026), 9.2 — Compound Division', 'Compound division equipment', r."id", now() from "rule" r where r."rule_code" = 'WA-INDOOR' and not exists (select 1 from "bow_category" c where c."rule_id" = r."id" and c."code" = 'CP');`,
    );
    this.addSql(
      `insert into "bow_category" ("id", "code", "name", "description_en", "description_pt", "description_it", "description_uk", "description_es", "rule_reference", "rule_citation", "rule_id", "created_at") select gen_random_uuid()::varchar, 'BB', 'Barebow', 'World Archery Barebow division. Recurve equipment without a sight or stabilisers.', 'Divisão Barebow da World Archery. Equipamento de recurvo sem mira nem estabilizadores.', 'Divisione Barebow World Archery. Attrezzatura da ricurvo senza mirino né stabilizzatori.', 'Дивізіон Barebow World Archery. Рекурсивне спорядження без прицілу та стабілізаторів.', 'División Barebow de World Archery. Equipo de recurvo sin mira ni estabilizadores.', 'World Archery Book 3 (2026), 9.3 — Barebow Division', 'Barebow division equipment', r."id", now() from "rule" r where r."rule_code" = 'WA-INDOOR' and not exists (select 1 from "bow_category" c where c."rule_id" = r."id" and c."code" = 'BB');`,
    );
    this.addSql(
      `update "tournament_application" ta set "bow_category_id" = mbtr."id", "updated_at" = now() from "bow_category" mbr join "rule" r on r."id" = mbr."rule_id" and r."rule_code" = 'FABP' join "bow_category" mbtr on mbtr."rule_id" = r."id" and mbtr."code" = 'MB-TR' where ta."bow_category_id" = mbr."id" and mbr."code" = 'MBR';`,
    );
    this.addSql(
      `delete from "bow_category" mbr using "rule" r where mbr."rule_id" = r."id" and r."rule_code" = 'FABP' and mbr."code" = 'MBR';`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `update "division" d set "description" = 'Boys under 12 years', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA' and d."name" = 'Cub Male';`,
    );
    this.addSql(
      `update "division" d set "description" = 'Girls under 12 years', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA' and d."name" = 'Cub Female';`,
    );
    this.addSql(
      `update "division" d set "description" = 'Boys 12-17 years', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA' and d."name" = 'Junior Male';`,
    );
    this.addSql(
      `update "division" d set "description" = 'Girls 12-17 years', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA' and d."name" = 'Junior Female';`,
    );
    this.addSql(
      `delete from "division" d using "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA' and d."name" = 'Young Adult Male';`,
    );
    this.addSql(
      `delete from "division" d using "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA' and d."name" = 'Young Adult Female';`,
    );
    this.addSql(
      `update "division" d set "description" = 'Men 18-49 years', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA' and d."name" = 'Adult Male';`,
    );
    this.addSql(
      `update "division" d set "description" = 'Women 18-49 years', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA' and d."name" = 'Adult Female';`,
    );
    this.addSql(
      `update "division" d set "description" = 'Men 50+ years', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA' and d."name" = 'Veteran Male';`,
    );
    this.addSql(
      `update "division" d set "description" = 'Women 50+ years', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA' and d."name" = 'Veteran Female';`,
    );
    this.addSql(
      `delete from "division" d using "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA' and d."name" = 'Senior Male';`,
    );
    this.addSql(
      `delete from "division" d using "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA' and d."name" = 'Senior Female';`,
    );
    this.addSql(
      `update "division" d set "description" = 'Boys under 12 years', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA-HB' and d."name" = 'Cub Male';`,
    );
    this.addSql(
      `update "division" d set "description" = 'Girls under 12 years', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA-HB' and d."name" = 'Cub Female';`,
    );
    this.addSql(
      `update "division" d set "description" = 'Boys 12-17 years', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA-HB' and d."name" = 'Junior Male';`,
    );
    this.addSql(
      `update "division" d set "description" = 'Girls 12-17 years', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA-HB' and d."name" = 'Junior Female';`,
    );
    this.addSql(
      `delete from "division" d using "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA-HB' and d."name" = 'Young Adult Male';`,
    );
    this.addSql(
      `delete from "division" d using "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA-HB' and d."name" = 'Young Adult Female';`,
    );
    this.addSql(
      `update "division" d set "description" = 'Men 18-49 years', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA-HB' and d."name" = 'Adult Male';`,
    );
    this.addSql(
      `update "division" d set "description" = 'Women 18-49 years', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA-HB' and d."name" = 'Adult Female';`,
    );
    this.addSql(
      `update "division" d set "description" = 'Men 50+ years', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA-HB' and d."name" = 'Veteran Male';`,
    );
    this.addSql(
      `update "division" d set "description" = 'Women 50+ years', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA-HB' and d."name" = 'Veteran Female';`,
    );
    this.addSql(
      `delete from "division" d using "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA-HB' and d."name" = 'Senior Male';`,
    );
    this.addSql(
      `delete from "division" d using "rule" r where d."rule_id" = r."id" and r."rule_code" = 'IFAA-HB' and d."name" = 'Senior Female';`,
    );
    this.addSql(
      `update "division" d set "description" = 'Boys under 12 years', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FABP' and d."name" = 'Cub Male';`,
    );
    this.addSql(
      `update "division" d set "description" = 'Girls under 12 years', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FABP' and d."name" = 'Cub Female';`,
    );
    this.addSql(
      `update "division" d set "description" = 'Boys 12-17 years', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FABP' and d."name" = 'Junior Male';`,
    );
    this.addSql(
      `update "division" d set "description" = 'Girls 12-17 years', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FABP' and d."name" = 'Junior Female';`,
    );
    this.addSql(
      `delete from "division" d using "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FABP' and d."name" = 'Young Adult Male';`,
    );
    this.addSql(
      `delete from "division" d using "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FABP' and d."name" = 'Young Adult Female';`,
    );
    this.addSql(
      `update "division" d set "description" = 'Men 18-49 years', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FABP' and d."name" = 'Adult Male';`,
    );
    this.addSql(
      `update "division" d set "description" = 'Women 18-49 years', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FABP' and d."name" = 'Adult Female';`,
    );
    this.addSql(
      `update "division" d set "description" = 'Men 50+ years', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FABP' and d."name" = 'Veteran Male';`,
    );
    this.addSql(
      `update "division" d set "description" = 'Women 50+ years', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FABP' and d."name" = 'Veteran Female';`,
    );
    this.addSql(
      `delete from "division" d using "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FABP' and d."name" = 'Senior Male';`,
    );
    this.addSql(
      `delete from "division" d using "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FABP' and d."name" = 'Senior Female';`,
    );
    this.addSql(
      `delete from "division" d using "rule" r where d."rule_id" = r."id" and r."rule_code" = 'HDH-IAA' and d."name" = 'Mini Male';`,
    );
    this.addSql(
      `delete from "division" d using "rule" r where d."rule_id" = r."id" and r."rule_code" = 'HDH-IAA' and d."name" = 'Mini Female';`,
    );
    this.addSql(
      `delete from "division" d using "rule" r where d."rule_id" = r."id" and r."rule_code" = 'HDH-IAA' and d."name" = 'Cadet Male';`,
    );
    this.addSql(
      `delete from "division" d using "rule" r where d."rule_id" = r."id" and r."rule_code" = 'HDH-IAA' and d."name" = 'Cadet Female';`,
    );
    this.addSql(
      `update "division" d set "description" = 'Boys 12-17 years', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'HDH-IAA' and d."name" = 'Junior Male';`,
    );
    this.addSql(
      `update "division" d set "description" = 'Girls 12-17 years', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'HDH-IAA' and d."name" = 'Junior Female';`,
    );
    this.addSql(
      `delete from "division" d using "rule" r where d."rule_id" = r."id" and r."rule_code" = 'HDH-IAA' and d."name" = 'Young Adult Male';`,
    );
    this.addSql(
      `delete from "division" d using "rule" r where d."rule_id" = r."id" and r."rule_code" = 'HDH-IAA' and d."name" = 'Young Adult Female';`,
    );
    this.addSql(
      `update "division" d set "description" = 'Men 18-49 years', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'HDH-IAA' and d."name" = 'Adult Male';`,
    );
    this.addSql(
      `update "division" d set "description" = 'Women 18-49 years', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'HDH-IAA' and d."name" = 'Adult Female';`,
    );
    this.addSql(
      `update "division" d set "description" = 'Men 50+ years', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'HDH-IAA' and d."name" = 'Veteran Male';`,
    );
    this.addSql(
      `update "division" d set "description" = 'Women 50+ years', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'HDH-IAA' and d."name" = 'Veteran Female';`,
    );
    this.addSql(
      `delete from "division" d using "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FPTA' and d."name" = 'Flechas Male';`,
    );
    this.addSql(
      `delete from "division" d using "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FPTA' and d."name" = 'Flechas Female';`,
    );
    this.addSql(
      `delete from "division" d using "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FPTA' and d."name" = 'Robins Male';`,
    );
    this.addSql(
      `delete from "division" d using "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FPTA' and d."name" = 'Robins Female';`,
    );
    this.addSql(
      `delete from "division" d using "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FPTA' and d."name" = 'Juvenis Male';`,
    );
    this.addSql(
      `delete from "division" d using "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FPTA' and d."name" = 'Juvenis Female';`,
    );
    this.addSql(
      `delete from "division" d using "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FPTA' and d."name" = 'Cadet Male';`,
    );
    this.addSql(
      `delete from "division" d using "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FPTA' and d."name" = 'Cadet Female';`,
    );
    this.addSql(
      `delete from "division" d using "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FPTA' and d."name" = 'Junior Male';`,
    );
    this.addSql(
      `delete from "division" d using "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FPTA' and d."name" = 'Junior Female';`,
    );
    this.addSql(
      `delete from "division" d using "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FPTA' and d."name" = 'Senior Male';`,
    );
    this.addSql(
      `delete from "division" d using "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FPTA' and d."name" = 'Senior Female';`,
    );
    this.addSql(
      `delete from "division" d using "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FPTA' and d."name" = 'Veteran Male';`,
    );
    this.addSql(
      `delete from "division" d using "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FPTA' and d."name" = 'Veteran Female';`,
    );
    this.addSql(
      `delete from "bow_category" c using "rule" r where c."rule_id" = r."id" and r."rule_code" = 'FABP' and c."code" in ('HLB', 'MB-LB', 'MB-TR', 'MB-SB');`,
    );
    this.addSql(
      `delete from "bow_category" c using "rule" r where c."rule_id" = r."id" and r."rule_code" in ('FPTA', 'WA', 'WA-INDOOR') and c."code" in ('RC', 'CP', 'BB');`,
    );
  }
}
