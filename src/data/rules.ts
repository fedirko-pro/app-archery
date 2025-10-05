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
    "description_en": "The official constitution, by-laws, and complete rules of the IFAA. Defines all bow styles, competition formats, tournament regulations, and equipment rules.",
    "description_pt": "A constituição oficial, estatutos e regulamentos completos da IFAA. Define todos os estilos de arco, formatos de competição, regulamentos de torneios e regras de equipamento.",
    "description_it": "La costituzione ufficiale, statuti e regolamenti completi della IFAA. Definisce tutti gli stili di arco, i formati di gara, i regolamenti dei tornei e le regole dell’attrezzatura.",
    "description_uk": "Офіційний статут, положення та повні правила IFAA. Визначає всі стилі луків, формати змагань, регламенти турнірів та правила обладнання.",
    "description_es": "La constitución oficial, estatutos y reglamento completo de la IFAA. Define todos los estilos de arco, formatos de competición, normativas de torneos y reglas de equipamiento.",
    "link": "https://ifaa-archery.org/index.php/documents",
    "download_link": "/mnt/data/2021-Book-of-Rules.pdf"
  },
  {
    "rule_code": "IFAA-HB",
    "rule_name": "International Field Archery Association — Archer’s Handbook",
    "edition": "7th Edition, 2021–2022",
    "description_en": "A condensed and explanatory handbook derived from the IFAA Book of Rules. Helps archers on the range by summarizing the key competition rules and styles.",
    "description_pt": "Manual resumido e explicativo derivado do Livro de Regras da IFAA. Ajuda os arqueiros no campo ao resumir as principais regras e estilos de competição.",
    "description_it": "Manuale sintetico ed esplicativo derivato dal Libro delle Regole IFAA. Aiuta gli arcieri sul campo riassumendo le principali regole e gli stili di gara.",
    "description_uk": "Стислий і пояснювальний довідник на основі Правил IFAA. Допомагає лучникам на рубежі, підсумовуючи основні правила та стилі змагань.",
    "description_es": "Manual condensado y explicativo derivado del Libro de Reglas de la IFAA. Ayuda a los arqueros en el campo resumiendo las reglas y estilos clave.",
    "link": "https://ifaa-archery.org/index.php/documents",
    "download_link": "/mnt/data/2021-Archers-Handbook.pdf"
  },
  {
    "rule_code": "FABP",
    "rule_name": "Federação dos Arqueiros e Besteiros de Portugal — Regulamento dos Quadros Competitivos",
    "edition": "QC2025",
    "description_en": "Portuguese national federation regulations for competitive archery. Defines local competition structures, championships, categories (including crossbow), and eligibility.",
    "description_pt": "Regulamento nacional português para o tiro com arco competitivo. Define estruturas de competição, campeonatos, categorias (incluindo besta) e elegibilidade.",
    "description_it": "Regolamento nazionale portoghese per il tiro con l’arco competitivo. Definisce strutture di gara locali, campionati, categorie (inclusa la balestra) e criteri di ammissibilità.",
    "description_uk": "Національний португальський регламент зі спортивної стрільби з лука. Визначає структури змагань, чемпіонати, категорії (включно з арбалетом) та вимоги до учасників.",
    "description_es": "Reglamento nacional portugués para el tiro con arco competitivo. Define estructuras de competición locales, campeonatos, categorías (incluida ballesta) y criterios de elegibilidad.",
    "link": "https://www.fabp.pt",
    "download_link": "/mnt/data/QC2025.pdf"
  },
  {
    "rule_code": "HDH-IAA",
    "rule_name": "HDH-IAA Historical Archery — Rules",
    "edition": "Effective 01.01.2025",
    "description_en": "International Historical Archery Association rulebook. Defines historical/traditional bow categories, competition formats, and authenticity requirements.",
    "description_pt": "Regulamento da Associação Internacional de Arco Histórico. Define categorias históricas/tradicionais, formatos de competição e requisitos de autenticidade.",
    "description_it": "Regolamento dell’Associazione Internazionale di Tiro con l’Arco Storico. Definisce categorie storiche/tradizionali, formati di gara e requisiti di autenticità.",
    "description_uk": "Правила Міжнародної асоціації історичної стрільби з лука. Визначають історичні/традиційні категорії, формати змагань та вимоги до автентичності.",
    "description_es": "Reglamento de la Asociación Internacional de Tiro con Arco Histórico (HDH-IAA). Define categorías históricas/tradicionales, formatos de competición y requisitos de autenticidad.",
    "link": "https://www.hdh-archery.com/rules",
    "download_link": "/mnt/data/Rules-of-HDH-HIST-2025.pdf"
  }
];

export default rulesData;


