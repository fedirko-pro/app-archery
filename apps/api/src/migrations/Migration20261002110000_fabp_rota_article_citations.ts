import { Migration } from '@mikro-orm/migrations';

/**
 * Rota dos Castelos bow classes are Art.º 27 in FABP Quadros Competitivos
 * (Actualização 2022 / QC2025 PDF), not Art.º 26 (Campeonato de Tiro com Besta).
 * Deployed rows still carry the Art. 26 citations from the prior migration.
 */
export class Migration20261002110000_fabp_rota_article_citations extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `update "bow_category" c set "rule_reference" = 'FABP QC2025, Art. 27 — Rota dos Castelos 1 (HLB)', "updated_at" = now() from "rule" r where c."rule_id" = r."id" and r."rule_code" = 'FABP' and c."code" = 'HLB' and c."rule_reference" is distinct from 'FABP QC2025, Art. 27 — Rota dos Castelos 1 (HLB)';`,
    );
    this.addSql(
      `update "bow_category" c set "rule_reference" = 'FABP QC2025, Art. 27 — Rota dos Castelos 2 (HBR)', "updated_at" = now() from "rule" r where c."rule_id" = r."id" and r."rule_code" = 'FABP' and c."code" = 'HBR' and c."rule_reference" is distinct from 'FABP QC2025, Art. 27 — Rota dos Castelos 2 (HBR)';`,
    );
    this.addSql(
      `update "bow_category" c set "rule_reference" = 'FABP QC2025, Art. 27 — Rota dos Castelos 3 (MB LB)', "updated_at" = now() from "rule" r where c."rule_id" = r."id" and r."rule_code" = 'FABP' and c."code" = 'MB-LB' and c."rule_reference" is distinct from 'FABP QC2025, Art. 27 — Rota dos Castelos 3 (MB LB)';`,
    );
    this.addSql(
      `update "bow_category" c set "rule_reference" = 'FABP QC2025, Art. 27 — Rota dos Castelos 4 (MB TR)', "updated_at" = now() from "rule" r where c."rule_id" = r."id" and r."rule_code" = 'FABP' and c."code" = 'MB-TR' and c."rule_reference" is distinct from 'FABP QC2025, Art. 27 — Rota dos Castelos 4 (MB TR)';`,
    );
    this.addSql(
      `update "bow_category" c set "rule_reference" = 'FABP QC2025, Art. 27 — Rota dos Castelos 5 (MB SB)', "updated_at" = now() from "rule" r where c."rule_id" = r."id" and r."rule_code" = 'FABP' and c."code" = 'MB-SB' and c."rule_reference" is distinct from 'FABP QC2025, Art. 27 — Rota dos Castelos 5 (MB SB)';`,
    );
    this.addSql(
      `update "bow_category" c set "rule_reference" = 'FABP QC2025, Art. 27 — Rota dos Castelos 6 (MC)', "updated_at" = now() from "rule" r where c."rule_id" = r."id" and r."rule_code" = 'FABP' and c."code" = 'MC' and c."rule_reference" is distinct from 'FABP QC2025, Art. 27 — Rota dos Castelos 6 (MC)';`,
    );
  }
}
