import { Migration } from '@mikro-orm/migrations';

/**
 * FABP Quadros Competitivos Atualização 2026 (QC2026):
 * - new PDF + edition/downloadLink
 * - Campeonato dos Castelos age divisions (Art. 7.1.1)
 * - restore MBR; retire MB-SB
 * - refresh Castelos bow-class citations (Art. 27)
 */
export class Migration20261002120000_fabp_qc2026_rules extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `update "rule" set "edition" = 'QC2026', "download_link" = '/uploads/rules/FABP_QC2026.pdf', "description_en" = 'Portuguese national federation regulations for competitive archery (Atualização 2026). Defines IFAA championship age classes, Campeonato dos Castelos divisions and bow classes (including crossbow), and eligibility.', "updated_at" = now() where "rule_code" = 'FABP';`,
    );

    for (const [name, description] of [
      ['Mancebos', 'Under 13 inclusive (unisex; Campeonato dos Castelos)'],
      ['Infantes', 'Boys 14-16 inclusive (Campeonato dos Castelos)'],
      ['Donzelas', 'Girls 14-16 inclusive (Campeonato dos Castelos)'],
      ['Cavaleiros', 'Men 17 and over (Campeonato dos Castelos)'],
      ['Damas', 'Women 17 and over (Campeonato dos Castelos)'],
    ] as const) {
      this.addSql(
        `insert into "division" ("id", "name", "description", "rule_id", "created_at") select gen_random_uuid()::varchar, '${name}', '${description}', r."id", now() from "rule" r where r."rule_code" = 'FABP' and not exists (select 1 from "division" d where d."rule_id" = r."id" and d."name" = '${name}');`,
      );
      this.addSql(
        `update "division" d set "description" = '${description}', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FABP' and d."name" = '${name}' and d."description" is distinct from '${description}';`,
      );
    }

    this.addSql(
      `update "division" d set "description" = 'Boys 13-16 inclusive', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FABP' and d."name" = 'Junior Male' and d."description" is distinct from 'Boys 13-16 inclusive';`,
    );
    this.addSql(
      `update "division" d set "description" = 'Girls 13-16 inclusive', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FABP' and d."name" = 'Junior Female' and d."description" is distinct from 'Girls 13-16 inclusive';`,
    );
    this.addSql(
      `update "division" d set "description" = 'Men 17-20 (suspended at national events)', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FABP' and d."name" = 'Young Adult Male' and d."description" is distinct from 'Men 17-20 (suspended at national events)';`,
    );
    this.addSql(
      `update "division" d set "description" = 'Women 17-20 (suspended at national events)', "updated_at" = now() from "rule" r where d."rule_id" = r."id" and r."rule_code" = 'FABP' and d."name" = 'Young Adult Female' and d."description" is distinct from 'Women 17-20 (suspended at national events)';`,
    );

    this.addSql(
      `insert into "bow_category" ("id", "code", "name", "description_en", "description_pt", "description_it", "description_uk", "description_es", "rule_reference", "rule_citation", "rule_id", "created_at") select gen_random_uuid()::varchar, 'MBR', 'Modern Bow Recurve', 'Horse/nomad-style recurve–reflex built entirely from modern materials (fiberglass, carbon, synthetics), one or two piece, no shooting window. Releases: Mediterranean, 3-under, thumb ring. Wood/bamboo arrows with natural feathers; horn/bone/metal/wood/self nocks.', 'Recurvo–reflexo estilo cavalo/nómada fabricado integralmente com materiais modernos (fibra de vidro, carbono, sintéticos), uma ou duas peças, sem janela de disparo. Liberações: Mediterrâneo, 3-embaixo, anel de polegar. Flechas de madeira/bambu com penas naturais; nocks em corno/osso/metal/madeira/self.', 'Ricurvo–reflex stile cavallo/nomade interamente in materiali moderni (vetroresina, carbonio, sintetici), uno o due pezzi, senza finestra. Rilasci: Mediterraneo, 3-sotto, anello da pollice. Frecce in legno/bambù con piume naturali; cocche in corno/osso/metallo/legno/self.', 'Рекурсивно-рефлексний кінний/кочовий стиль повністю з сучасних матеріалів (склопластик, карбон, синтетика), одна або дві частини, без вікна. Хват: середземноморський, 3-під, кільце. Стріли з дерева/бамбука з натуральним оперенням; ноки з рогу/кістки/металу/дерева/self.', 'Recurvo–réflex estilo caballo/nómada fabricado íntegramente con materiales modernos (fibra de vidrio, carbono, sintéticos), de una o dos piezas, sin ventana. Liberaciones: mediterránea, tres por debajo, anillo de pulgar. Flechas de madera/bambú con plumas naturales; culatines de cuerno/hueso/metal/madera/self.', 'FABP QC2026, Art. 27 — Campeonato dos Castelos B.2 (MBR)', 'Modern bow recurve for Campeonato dos Castelos', r."id", now() from "rule" r where r."rule_code" = 'FABP' and not exists (select 1 from "bow_category" c where c."rule_id" = r."id" and c."code" = 'MBR');`,
    );

    this.addSql(
      `update "tournament_application" ta set "bow_category_id" = mbtr."id", "updated_at" = now() from "bow_category" mbsb join "rule" r on r."id" = mbsb."rule_id" and r."rule_code" = 'FABP' join "bow_category" mbtr on mbtr."rule_id" = r."id" and mbtr."code" = 'MB-TR' where ta."bow_category_id" = mbsb."id" and mbsb."code" = 'MB-SB';`,
    );
    this.addSql(
      `delete from "bow_category" mbsb using "rule" r where mbsb."rule_id" = r."id" and r."rule_code" = 'FABP' and mbsb."code" = 'MB-SB';`,
    );

    const citationUpdates: Array<[string, string, string]> = [
      [
        'HLB',
        'FABP QC2026, Art. 27 — Campeonato dos Castelos A (HLB)',
        'Historical longbow for Campeonato dos Castelos',
      ],
      [
        'HBR',
        'FABP QC2026, Art. 27 — Campeonato dos Castelos B.1 (HBR)',
        'Historical bow recurve rules',
      ],
      [
        'MBR',
        'FABP QC2026, Art. 27 — Campeonato dos Castelos B.2 (MBR)',
        'Modern bow recurve for Campeonato dos Castelos',
      ],
      [
        'MB-LB',
        'FABP QC2026, Art. 27 — Campeonato dos Castelos C (MB LB)',
        'Modern longbow for Campeonato dos Castelos',
      ],
      [
        'MB-TR',
        'FABP QC2026, Art. 27 — Campeonato dos Castelos D (MB TR)',
        'Modern traditional recurve for Campeonato dos Castelos',
      ],
      ['MC', 'FABP QC2026, Art. 27 — Campeonato dos Castelos E (MC)', 'Medieval crossbow rules'],
      [
        'SC-St',
        'FABP QC2026, Art. 8.2 — Categorias Crossbow Unissexo (SC-St, SC-Fs, TC, MC)',
        'Sport crossbow standard rules',
      ],
      [
        'SC-Fs',
        'FABP QC2026, Art. 8.2 — Categorias Crossbow Unissexo (SC-St, SC-Fs, TC, MC)',
        'Sport crossbow freestyle rules',
      ],
      [
        'TC',
        'FABP QC2026, Art. 8.2 — Categorias Crossbow Unissexo (SC-St, SC-Fs, TC, MC)',
        'Target crossbow rules',
      ],
    ];
    for (const [code, reference, citation] of citationUpdates) {
      this.addSql(
        `update "bow_category" c set "rule_reference" = '${reference.replace(/'/g, "''")}', "rule_citation" = '${citation.replace(/'/g, "''")}', "updated_at" = now() from "rule" r where c."rule_id" = r."id" and r."rule_code" = 'FABP' and c."code" = '${code}';`,
      );
    }

    this.addSql(
      `update "bow_category" c set "rule_reference" = 'FABP QC2026, Art. 8 — IFAA classes accepted', "updated_at" = now() from "rule" r where c."rule_id" = r."id" and r."rule_code" = 'FABP' and c."rule_reference" like 'FABP QC2025, Art. 8 — IFAA%';`,
    );
  }
}
