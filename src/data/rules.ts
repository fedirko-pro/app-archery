import type { RuleDto } from '../services/types';

/**
* FE-only seed data for bow rules, used until the backend is ready.
 * Extend freely during development; URLs for rule citations will point to /rules#<citation>.
 */
const rulesData: RuleDto[] = [
    {
      "rule_code": "IFAA",
      "rule_name": "International Field Archery Association — Book of Rules",
      "edition": "18th Edition, 2021–2022 (Rev. 04 April 2021)",
      "description": "The official constitution, by-laws, and complete rules of the IFAA. Defines all bow styles, competition formats, tournament regulations, and equipment rules.",
      "link": "https://ifaa-archery.org/index.php/documents",
      "download_link": "/mnt/data/2021-Book-of-Rules.pdf"
    },
    {
      "rule_code": "IFAA-HB",
      "rule_name": "International Field Archery Association — Archer’s Handbook",
      "edition": "7th Edition, 2021–2022",
      "description": "A condensed and explanatory handbook derived from the IFAA Book of Rules. Intended to assist archers on the range by summarizing key competition rules and styles.",
      "link": "https://ifaa-archery.org/index.php/documents",
      "download_link": "/mnt/data/2021-Archers-Handbook.pdf"
    },
    {
      "rule_code": "FABP",
      "rule_name": "Federação dos Arqueiros e Besteiros de Portugal — Regulamento dos Quadros Competitivos",
      "edition": "QC2025",
      "description": "National Portuguese federation regulations for competitive archery. Defines local competition structures, championships, categories (including crossbow), and eligibility.",
      "link": "https://www.fabp.pt",
      "download_link": "/mnt/data/QC2025.pdf"
    },
    {
      "rule_code": "HDH-IAA",
      "rule_name": "HDH-IAA Historical Archery — Rules",
      "edition": "Effective 01.01.2025",
      "description": "International Historical Archery Association rulebook. Defines historical and traditional bow categories, competition formats, and authenticity requirements.",
      "link": "https://www.hdh-archery.com/rules",
      "download_link": "/mnt/data/Rules-of-HDH-HIST-2025.pdf"
    }
  ];

export default rulesData;


