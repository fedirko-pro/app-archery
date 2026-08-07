import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Rule } from '../rule/rule.entity';

export class RuleSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    console.log('📋 Seeding rules...');

    const rules = [
      // Portuguese federations first
      {
        ruleCode: 'FABP',
        ruleName:
          'Federação dos Arqueiros e Besteiros de Portugal — Regulamento dos Quadros Competitivos',
        edition: 'QC2025',
        descriptionEn:
          'Portuguese national federation regulations for competitive archery. Defines local competition structures, championships, categories (including crossbow), and eligibility.',
        descriptionPt:
          'Regulamento nacional português para o tiro com arco competitivo. Define estruturas de competição, campeonatos, categorias (incluindo besta) e elegibilidade.',
        descriptionIt:
          "Regolamento nazionale portoghese per il tiro con l'arco competitivo. Definisce strutture di gara locali, campionati, categorie (inclusa la balestra) e criteri di ammissibilità.",
        descriptionUk:
          'Національний португальський регламент зі спортивної стрільби з лука. Визначає структури змагань, чемпіонати, категорії (включно з арбалетом) та вимоги до учасників.',
        descriptionEs:
          'Reglamento nacional portugués para el tiro con arco competitivo. Define estructuras de competición locales, campeonatos, categorías (incluida ballesta) y criterios de elegibilidad.',
        link: 'https://www.fabp.pt',
        downloadLink: '/uploads/rules/FABP_QC2025.pdf',
      },
      {
        ruleCode: 'FPTA',
        ruleName:
          'Federação Portuguesa de Tiro com Arco — Regulamento de Organização de Quadros Competitivos',
        edition: 'fevereiro 2026',
        descriptionEn:
          'Official competition regulations of the Portuguese Archery Federation (FPTA), the national governing body affiliated with World Archery. Defines competition formats, categories (Recurve, Compound, Barebow), age divisions, distances, scoring, and eligibility for all national-level archery in Portugal.',
        descriptionPt:
          'Regulamento oficial de competição da Federação Portuguesa de Tiro com Arco (FPTA), o órgão nacional filiado na World Archery. Define formatos de competição, categorias (Recurvo, Compound, Barebow), escalões etários, distâncias, pontuação e elegibilidade para todo o tiro com arco de nível nacional em Portugal.',
        descriptionIt:
          "Regolamento ufficiale di gara della Federazione Portoghese di Tiro con l'Arco (FPTA), l'organo nazionale affiliato a World Archery. Definisce formati di gara, categorie (Ricurvo, Compound, Nudo), divisioni per età, distanze, punteggio e criteri di ammissibilità per il tiro con l'arco a livello nazionale in Portogallo.",
        descriptionUk:
          'Офіційний регламент змагань Португальської федерації стрільби з лука (FPTA), національного керівного органу, афілійованого з World Archery. Визначає формати змагань, категорії (Recurve, Compound, Barebow), вікові дивізіони, дистанції, підрахунок балів та вимоги до участі для всіх національних змагань зі стрільби з лука в Португалії.',
        descriptionEs:
          'Reglamento oficial de competición de la Federación Portuguesa de Tiro con Arco (FPTA), el organismo nacional afiliado a World Archery. Define formatos de competición, categorías (Recurvo, Compound, Desnudo), divisiones por edad, distancias, puntuación y elegibilidad para todo el tiro con arco a nivel nacional en Portugal.',
        link: 'https://www.fpta.pt/como-funciona/',
        downloadLink: '/uploads/rules/FPTA_Regulamento_Quadros_Competitivos_fev2026.pdf',
      },
      {
        ruleCode: 'IFAA',
        ruleName: 'International Field Archery Association — Book of Rules',
        edition: '18th Edition, 2021–2022 (Rev. 04 April 2021)',
        descriptionEn:
          'The official constitution, by-laws, and complete rules of the IFAA. Defines all bow styles, competition formats, tournament regulations, and equipment rules.',
        descriptionPt:
          'A constituição oficial, estatutos e regulamentos completos da IFAA. Define todos os estilos de arco, formatos de competição, regulamentos de torneios e regras de equipamento.',
        descriptionIt:
          "La costituzione ufficiale, statuti e regolamenti completi della IFAA. Definisce tutti gli stili di arco, i formati di gara, i regolamenti dei tornei e le regole dell'attrezzatura.",
        descriptionUk:
          'Офіційний статут, положення та повні правила IFAA. Визначає всі стилі луків, формати змагань, регламенти турнірів та правила обладнання.',
        descriptionEs:
          'La constitución oficial, estatutos y reglamento completo de la IFAA. Define todos los estilos de arco, formatos de competición, normativas de torneos y reglas de equipamiento.',
        link: 'https://ifaa-archery.org/index.php/documents',
        downloadLink: '/uploads/rules/IFAA_2021_Book_of_Rules.pdf',
      },
      {
        ruleCode: 'IFAA-HB',
        ruleName: "International Field Archery Association — Archer's Handbook",
        edition: '7th Edition, 2021–2022',
        descriptionEn:
          'A condensed and explanatory handbook derived from the IFAA Book of Rules. Helps archers on the range by summarizing the key competition rules and styles.',
        descriptionPt:
          'Manual resumido e explicativo derivado do Livro de Regras da IFAA. Ajuda os arqueiros no campo ao resumir as principais regras e estilos de competição.',
        descriptionIt:
          'Manuale sintetico ed esplicativo derivato dal Libro delle Regole IFAA. Aiuta gli arcieri sul campo riassumendo le principali regole e gli stili di gara.',
        descriptionUk:
          'Стислий і пояснювальний довідник на основі Правил IFAA. Допомагає лучникам на рубежі, підсумовуючи основні правила та стилі змагань.',
        descriptionEs:
          'Manual condensado y explicativo derivado del Libro de Reglas de la IFAA. Ayuda a los arqueros en el campo resumiendo las reglas y estilos clave.',
        link: 'https://ifaa-archery.org/index.php/documents',
        downloadLink: '/uploads/rules/IFAA_2021_Archers_Handbook.pdf',
      },
      {
        ruleCode: 'HDH-IAA',
        ruleName: 'HDH-IAA Historical Archery — Rules',
        edition: 'Effective 01.01.2025',
        descriptionEn:
          'International Historical Archery Association rulebook. Defines historical/traditional bow categories, competition formats, and authenticity requirements.',
        descriptionPt:
          'Regulamento da Associação Internacional de Arco Histórico. Define categorias históricas/tradicionais, formatos de competição e requisitos de autenticidade.',
        descriptionIt:
          "Regolamento dell'Associazione Internazionale di Tiro con l'Arco Storico. Definisce categorie storiche/tradizionali, formati di gara e requisiti di autenticità.",
        descriptionUk:
          'Правила Міжнародної асоціації історичної стрільби з лука. Визначають історичні/традиційні категорії, формати змагань та вимоги до автентичності.',
        descriptionEs:
          'Reglamento de la Asociación Internacional de Tiro con Arco Histórico (HDH-IAA). Define categorías históricas/tradicionales, formatos de competición y requisitos de autenticidad.',
        link: 'https://www.hdh-archery.com/rules',
        downloadLink: '/uploads/rules/Rules_of_HDH_HIST_2025.pdf',
      },
      {
        ruleCode: 'WA',
        ruleName: 'World Archery — Rulebook',
        edition: 'Version 2026-01-27 (Published 27 January 2026, revised 13 March 2026)',
        descriptionEn:
          'The official rulebook of World Archery, the international governing body for Olympic and Paralympic archery. Covers target archery (outdoor and indoor), field archery, 3D archery, and all bow styles recognized in international competition.',
        descriptionPt:
          'O livro de regras oficial da World Archery, o órgão internacional que rege o tiro com arco olímpico e paralímpico. Abrange tiro ao alvo (ao ar livre e indoor), campo, 3D e todos os estilos de arco reconhecidos em competições internacionais.',
        descriptionIt:
          "Il regolamento ufficiale di World Archery, l'organo internazionale che governa il tiro con l'arco olimpico e paralimpico. Copre il tiro su bersaglio (outdoor e indoor), il tiro di campagna, il 3D e tutti gli stili di arco riconosciuti a livello internazionale.",
        descriptionUk:
          'Офіційний регламент Всесвітньої федерації стрільби з лука (World Archery), міжнародного керівного органу з олімпійської та паралімпійської стрільби з лука. Охоплює стрільбу по мішенях (вуличну та закриту), польову стрільбу, 3D та всі стилі луків, визнані на міжнародних змаганнях.',
        descriptionEs:
          'El libro de reglas oficial de World Archery, el organismo rector internacional para el tiro con arco olímpico y paralímpico. Cubre tiro al blanco (exterior e interior), tiro de campo, 3D y todos los estilos de arco reconocidos en competición internacional.',
        link: 'https://www.worldarchery.sport/rulebook',
        downloadLink: '/uploads/rules/EN-Book_1_-_2026-01-27_Version.pdf',
      },
      {
        ruleCode: 'WA-INDOOR',
        ruleName: 'World Archery — Indoor Archery Rules',
        edition: '2026 (Book 3: Target Archery, Indoor sections)',
        descriptionEn:
          'Indoor archery rules under World Archery regulations. Covers 18 m and 25 m indoor rounds, target faces, equipment specifications, and competition formats for recurve, compound, and barebow divisions.',
        descriptionPt:
          'Regras de tiro indoor de acordo com os regulamentos da World Archery. Abrange as rodadas indoor de 18 m e 25 m, faces de alvo, especificações de equipamento e formatos de competição para as divisões recurvo, compound e barebow.',
        descriptionIt:
          "Regole del tiro indoor secondo i regolamenti World Archery. Copre i turni indoor da 18 m e 25 m, facce del bersaglio, specifiche dell'attrezzatura e formati di gara per le divisioni arco ricurvo, compound e nudo.",
        descriptionUk:
          'Правила стрільби в закритих приміщеннях згідно з регламентом World Archery. Охоплює indoor раунди на 18 м та 25 м, мішені, специфікації обладнання та формати змагань для дивізіонів recurve, compound та barebow.',
        descriptionEs:
          'Reglas de tiro en sala según la normativa de World Archery. Cubre las rondas indoor de 18 m y 25 m, caras de diana, especificaciones de equipo y formatos de competición para las divisiones de recurvo, compound y desnudo.',
        link: 'https://www.worldarchery.sport/rulebook',
        downloadLink: '/uploads/rules/EN-Book_3_-_2026-01-27_Version.pdf',
      },
      {
        ruleCode: 'NFAA',
        ruleName: 'National Field Archery Association (USA) — Constitution & By-Laws',
        edition: '2026–27',
        descriptionEn:
          'Official constitution, by-laws, and tournament regulations of the National Field Archery Association (USA). Defines all field, hunter, and target rounds, bow styles (including freestyle, barebow, longbow, and traditional), and scoring systems.',
        descriptionPt:
          'Constituição oficial, estatutos e regulamentos de torneios da National Field Archery Association (EUA). Define todas as rodadas de campo, caça e alvo, estilos de arco (incluindo freestyle, barebow, longbow e traditional) e sistemas de pontuação.',
        descriptionIt:
          'Costituzione ufficiale, statuti e regolamenti dei tornei della National Field Archery Association (USA). Definisce tutti i turni di campagna, caccia e bersaglio, stili di arco (inclusi freestyle, nudo, longbow e tradizionale) e sistemi di punteggio.',
        descriptionUk:
          'Офіційний статут, положення та регламенти змагань Національної асоціації польової стрільби з лука (США). Визначає всі польові, мисливські та мішеневі раунди, стилі луків (включаючи freestyle, barebow, longbow та traditional) та системи підрахунку балів.',
        descriptionEs:
          'Constitución oficial, estatutos y reglamentos de torneos de la National Field Archery Association (EE. UU.). Define todas las rondas de campo, caza y blanco, estilos de arco (incluyendo freestyle, desnudo, longbow y tradicional) y sistemas de puntuación.',
        link: 'https://nfaausa.com/about/constitution',
        downloadLink: '/uploads/rules/NFAA_Bylaws_2026-27.pdf',
      },
      {
        ruleCode: 'IBO',
        ruleName: 'International Bowhunting Organization — Rules & Class Definitions',
        edition: '2026',
        descriptionEn:
          'Official rules and class definitions of the International Bowhunting Organization (IBO). Governs 3D archery competitions, hunter and bowhunter classes, traditional divisions, scoring methods, and equipment regulations.',
        descriptionPt:
          'Regras oficiais e definições de classes da International Bowhunting Organization (IBO). Rege competições 3D, classes hunter e bowhunter, divisões tradicionais, métodos de pontuação e regulamentos de equipamento.',
        descriptionIt:
          "Regole ufficiali e definizioni delle classi dell'International Bowhunting Organization (IBO). Regola le competizioni 3D, le classi cacciatore e bowhunter, le divisioni tradizionali, i metodi di punteggio e i regolamenti dell'attrezzatura.",
        descriptionUk:
          'Офіційні правила та визначення класів Міжнародної організації полювання з лука (IBO). Регулює змагання 3D, класи hunter та bowhunter, традиційні дивізіони, методи підрахунку балів та правила обладнання.',
        descriptionEs:
          'Reglas oficiales y definiciones de clases de la International Bowhunting Organization (IBO). Rige las competiciones 3D, clases de cazador y bowhunter, divisiones tradicionales, métodos de puntuación y regulaciones de equipo.',
        link: 'https://iboarchery.com/rules-and-regulations',
        downloadLink: '/uploads/rules/IBO_2026_Rules.pdf',
      },
      {
        ruleCode: 'FITARCO',
        ruleName: "Federazione Italiana Tiro con l'Arco — Regolamenti Tecnici",
        edition: 'In vigore dal 1° gennaio 2026',
        descriptionEn:
          'Technical shooting regulations and federal documents of the Italian Archery Federation (FITARCO). Defines all competition formats, bow categories, equipment rules, and classifications for national-level archery in Italy.',
        descriptionPt:
          'Regulamentos técnicos de tiro e documentos federais da Federação Italiana de Tiro com Arco (FITARCO). Define todos os formatos de competição, categorias de arco, regras de equipamento e classificações para o tiro com arco a nível nacional em Itália.',
        descriptionIt:
          "Regolamenti tecnici di tiro e documenti federali della Federazione Italiana Tiro con l'Arco (FITARCO). Definisce tutti i formati di gara, le categorie di arco, le regole dell'attrezzatura e le classificazioni per il tiro con l'arco a livello nazionale in Italia.",
        descriptionUk:
          'Технічні регламенти стрільби та федеральні документи Італійської федерації стрільби з лука (FITARCO). Визначає всі формати змагань, категорії луків, правила обладнання та класифікації для національного рівня стрільби з лука в Італії.',
        descriptionEs:
          'Reglamentos técnicos de tiro y documentos federales de la Federación Italiana de Tiro con Arco (FITARCO). Define todos los formatos de competición, categorías de arco, reglas de equipo y clasificaciones para el tiro con arco a nivel nacional en Italia.',
        link: 'https://www.fitarco.it/federazione/documenti/regolamenti-tecnici-1/regolamento-tecnico-di-tiro-in-vigore-dal-1%C2%B0-settembre-2022.html',
      },
      {
        ruleCode: 'RFETA',
        ruleName: 'Real Federación Española de Tiro con Arco — Reglamentos',
        edition: '2025',
        descriptionEn:
          'Official regulations of the Royal Spanish Archery Federation (RFETA). Establishes national competition formats, categories, classification systems, and championship rules for target, field, and indoor archery in Spain.',
        descriptionPt:
          'Regulamentos oficiais da Real Federação Espanhola de Tiro com Arco (RFETA). Estabelece formatos de competição nacionais, categorias, sistemas de classificação e regras de campeonato para tiro ao alvo, campo e indoor em Espanha.',
        descriptionIt:
          "Regolamenti ufficiali della Reale Federazione Spagnola di Tiro con l'Arco (RFETA). Stabilisce formati di gara nazionali, categorie, sistemi di classificazione e regole per campionati di tiro al bersaglio, campagna e indoor in Spagna.",
        descriptionUk:
          'Офіційні регламенти Королівської іспанської федерації стрільби з лука (RFETA). Встановлює національні формати змагань, категорії, системи класифікації та правила чемпіонатів зі стрільби по мішенях, польової та закритої стрільби в Іспанії.',
        descriptionEs:
          'Reglamentos oficiales de la Real Federación Española de Tiro con Arco (RFETA). Establece los formatos de competición nacionales, categorías, sistemas de clasificación y normas de campeonato para el tiro con arco al blanco, campo e interior en España.',
        link: 'https://www.federarco.es/normativas-reglamentos/reglamentos',
      },
      {
        ruleCode: 'FSLU',
        ruleName: 'Всеукраїнська федерація стрільби з лука — Правила змагань',
        edition: '2024 (Правила від 30.10.2024 № 43/3.1/24)',
        descriptionEn:
          'Official competition rules of the All-Ukrainian Archery Federation (ФСЛУ). Defines competition formats, categories, equipment standards, and regulations for target, indoor, field, and 3D archery in Ukraine.',
        descriptionPt:
          'Regras oficiais de competição da Federação Ucraniana de Tiro com Arco (ФСЛУ). Define formatos de competição, categorias, padrões de equipamento e regulamentos para tiro ao alvo, indoor, campo e 3D na Ucrânia.',
        descriptionIt:
          "Regole ufficiali di gara della Federazione Ucraina di Tiro con l'Arco (ФСЛУ). Definisce formati di gara, categorie, standard dell'attrezzatura e regolamenti per il tiro al bersaglio, indoor, campagna e 3D in Ucraina.",
        descriptionUk:
          'Офіційні правила змагань Всеукраїнської федерації стрільби з лука (ФСЛУ). Визначають формати змагань, категорії, стандарти обладнання та регламенти для стрільби по мішенях, у закритих приміщеннях, польової та 3D стрільби в Україні.',
        descriptionEs:
          'Reglas oficiales de competición de la Federación Ucraniana de Tiro con Arco (ФСЛУ). Define formatos de competición, categorías, estándares de equipo y reglamentos para tiro al blanco, interior, campo y 3D en Ucrania.',
        link: 'https://archeryua.com/docs/',
        downloadLink: '/uploads/rules/FSLU_Pravyla_2022.pdf',
      },
      {
        ruleCode: 'AGB',
        ruleName: 'Archery GB — Rules of Shooting',
        edition: 'Effective 2 April 2026',
        descriptionEn:
          "Official Rules of Shooting of Archery GB, the UK's national governing body. Includes Part 9 Traditional Longbow rules (wood-only bows, traditional arrows, no sights), traditional recurve, and full competition regulations for all bow styles.",
        descriptionPt:
          'Regras Oficiais de Tiro da Archery GB, o órgão nacional do Reino Unido. Inclui a Parte 9 sobre Longbow Tradicional (arcos de madeira, flechas tradicionais, sem miras), recurvo tradicional e regulamentos completos de competição para todos os estilos de arco.',
        descriptionIt:
          "Regole Ufficiali di Tiro di Archery GB, l'organo nazionale del Regno Unito. Include la Parte 9 sul Longbow Tradizionale (archi in legno, frecce tradizionali, senza mirini), arco ricurvo tradizionale e regolamenti completi per tutti gli stili di arco.",
        descriptionUk:
          "Офіційні правила стрільби Archery GB, національного керівного органу Великої Британії. Включає Частину 9 про традиційний довгий лук (дерев'яні луки, традиційні стріли, без прицілів), традиційний recurve та повні регламенти змагань для всіх стилів луків.",
        descriptionEs:
          'Reglas Oficiales de Tiro de Archery GB, el organismo rector nacional del Reino Unido. Incluye la Parte 9 sobre el Arco Largo Tradicional (arcos de madera, flechas tradicionales, sin miras), recurvo tradicional y reglamentos completos de competición para todos los estilos de arco.',
        link: 'https://archerygb.org/about/governance/regulations-and-laws',
        downloadLink: '/uploads/rules/AGB_Rules_of_Shooting.pdf',
      },
    ];

    const toPersist: Rule[] = [];
    for (let i = 0; i < rules.length; i++) {
      const ruleData = { ...rules[i], sortOrder: i + 1 };
      const existing = await em.findOne(Rule, { ruleCode: ruleData.ruleCode });
      if (!existing) {
        const rule = em.create(Rule, ruleData);
        toPersist.push(rule);
      } else {
        existing.sortOrder = i + 1;
        existing.downloadLink = ruleData.downloadLink;
        existing.link = ruleData.link;
        toPersist.push(existing);
      }
    }
    await em.persistAndFlush(toPersist);

    console.log(
      `✅ ${toPersist.length} rules created (${rules.length - toPersist.length} already existed)`,
    );
  }
}
