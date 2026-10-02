import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { BowCategory } from '../bow-category/bow-category.entity';
import { Rule } from '../rule/rule.entity';

const IFAA_CATEGORY_CODES = new Set([
  'BBC',
  'BBR',
  'BHC',
  'BHR',
  'BL',
  'BU',
  'FSC',
  'FSR',
  'FU',
  'HB',
  'LB',
  'TR',
]);

interface CategoryData {
  code: string;
  name: string;
  descriptionEn?: string;
  descriptionPt?: string;
  descriptionIt?: string;
  descriptionUk?: string;
  descriptionEs?: string;
  ruleReference: string;
  ruleCitation: string;
}

function pickRule(
  ruleReference: string,
  ifaaRule: Rule,
  fabpRule: Rule | null,
  hdhRule: Rule | null,
): Rule {
  if (ruleReference.includes('FABP')) return fabpRule || ifaaRule;
  if (ruleReference.includes('HDH-IAA')) return hdhRule || ifaaRule;
  return ifaaRule;
}

async function ensureCategory(
  em: EntityManager,
  catData: CategoryData,
  rule: Rule,
): Promise<BowCategory | null> {
  const existing = await em.findOne(BowCategory, { code: catData.code, rule: rule.id });
  if (existing) return null;

  const cat = em.create(BowCategory, {
    ...catData,
    rule,
  });
  await em.persist(cat).flush();
  return cat;
}

/**
 * Seeder for Bow Categories
 */
export class BowCategorySeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    console.log('🏹 Seeding Bow Categories...\n');

    const ifaaRule = await em.findOne(Rule, { ruleCode: 'IFAA' });
    const fabpRule = await em.findOne(Rule, { ruleCode: 'FABP' });
    const hdhRule = await em.findOne(Rule, { ruleCode: 'HDH-IAA' });

    if (!ifaaRule) {
      console.log('❌ IFAA rule not found, skipping bow category seeding');
      return;
    }

    const bowCategories: CategoryData[] = [
      {
        code: 'BBC',
        name: 'Barebow Compound',
        descriptionEn:
          'Compound without sights; single nocking point; draw stops allowed; stabilizers allowed.',
        descriptionPt:
          'Compound sem miras; um ponto de encordoamento; batentes de tração permitidos; estabilizadores permitidos.',
        descriptionIt:
          'Compound senza mirini; un punto di incocco; fine corsa consentiti; stabilizzatori ammessi.',
        descriptionUk:
          'Блочний без прицілів; одна точка накладання; упори натягу дозволені; стабілізатори дозволені.',
        descriptionEs:
          'Compuesto sin miras; un único punto de nock; topes de apertura permitidos; estabilizadores permitidos.',
        ruleReference: 'IFAA Book of Rules (2021), Article IV.E.1 — Barebow (Compound)',
        ruleCitation: 'Barebow compound rules and restrictions',
      },
      {
        code: 'BBR',
        name: 'Barebow Recurve',
        descriptionEn:
          'Recurve without sights; single nocking point; optional non-adjustable draw check/level below arrow; stabilizers allowed.',
        descriptionPt:
          'Recurvo sem miras; um ponto de encordoamento; verificador/nível não ajustável opcional abaixo da flecha; estabilizadores permitidos.',
        descriptionIt:
          'Ricurvo senza mirini; un punto di incocco; controllo/livella non regolabile opzionale sotto la freccia; stabilizzatori ammessi.',
        descriptionUk:
          "Рекурсивний без прицілів; одна точка накладання; необов'язковий нерегульований індикатор/рівень під стрілою; стабілізатори дозволені.",
        descriptionEs:
          'Recurvo sin miras; un único punto de nock; comprobador o nivel no ajustable opcional bajo la flecha; estabilizadores permitidos.',
        ruleReference: 'IFAA Book of Rules (2021), Article IV.E.1 — Barebow (Recurve)',
        ruleCitation: 'Barebow recurve rules and restrictions',
      },
      {
        code: 'BHC',
        name: 'Bowhunter Compound',
        descriptionEn:
          'Compound shot with fingers; no sights/peep/level; one straight stabilizer (length-limited); draw stops allowed.',
        descriptionPt:
          'Compound disparado com dedos; sem miras/peep/nível; um estabilizador reto (comprimento limitado); batentes de tração permitidos.',
        descriptionIt:
          'Compound con tiro a dita; senza mirini/peep/livella; un solo stabilizzatore dritto (lunghezza limitata); fine corsa consentiti.',
        descriptionUk:
          'Блочний, стрільба пальцями; без прицілів/peep/рівня; один прямий стабілізатор (обмеженої довжини); упори натягу дозволені.',
        descriptionEs:
          'Compuesto disparado con los dedos; sin miras/peep/nivel; un estabilizador recto (longitud limitada); topes de apertura permitidos.',
        ruleReference: 'IFAA Book of Rules (2021), Article IV.E.4 — Bowhunter (Recurve & Compound)',
        ruleCitation: 'Bowhunter compound rules and restrictions',
      },
      {
        code: 'BHR',
        name: 'Bowhunter Recurve',
        descriptionEn:
          'Recurve shot with fingers; no sights/peep/kisser/level; one straight stabilizer (length-limited).',
        descriptionPt:
          'Recurvo disparado com dedos; sem miras/peep/kisser/nível; um estabilizador reto (comprimento limitado).',
        descriptionIt:
          'Ricurvo con tiro a dita; senza mirini/peep/kisser/livella; un solo stabilizzatore dritto (lunghezza limitata).',
        descriptionUk:
          'Рекурсивний, стрільба пальцями; без прицілів/peep/kisser/рівня; один прямий стабілізатор (обмеженої довжини).',
        descriptionEs:
          'Recurvo disparado con los dedos; sin miras/peep/kisser/nivel; un estabilizador recto (longitud limitada).',
        ruleReference: 'IFAA Book of Rules (2021), Article IV.E.4 — Bowhunter (Recurve & Compound)',
        ruleCitation: 'Bowhunter recurve rules and restrictions',
      },
      {
        code: 'BL',
        name: 'Bowhunter Limited',
        descriptionEn: 'As Bowhunter Unlimited but shot with fingers only; no mechanical release.',
        descriptionPt: 'Como Bowhunter Unlimited mas apenas com dedos; sem disparador mecânico.',
        descriptionIt: 'Come Bowhunter Unlimited ma solo con le dita; nessuno sgancio meccanico.',
        descriptionUk:
          'Як Bowhunter Unlimited, але стрільба тільки пальцями; без механічного релізу.',
        descriptionEs:
          'Como Bowhunter Unlimited pero disparando solo con los dedos; sin disparador mecánico.',
        ruleReference: 'IFAA Book of Rules (2021), Article IV.E.6 — Bowhunter Limited',
        ruleCitation: 'Bowhunter limited rules and restrictions',
      },
      {
        code: 'BU',
        name: 'Bowhunter Unlimited',
        descriptionEn:
          '4–5 fixed-pin sight; release aid allowed; peep OR kisser (not both); limited stabilizer; no scopes.',
        descriptionPt:
          'Mira de 4–5 pinos fixos; disparador permitido; peep OU kisser (não ambos); estabilizador limitado; sem lunetas.',
        descriptionIt:
          'Mirino a 4–5 pin fissi; sgancio consentito; peep OPPURE kisser (non entrambi); stabilizzatore limitato; niente lenti/scope.',
        descriptionUk:
          'Приціл із 4–5 фіксованими пінами; реліз дозволено; peep АБО kisser (не обидва); обмежений стабілізатор; без оптики.',
        descriptionEs:
          'Mira de 4–5 pines fijos; disparador permitido; peep o kisser (no ambos); estabilizador limitado; sin lentes/visores ópticos.',
        ruleReference: 'IFAA Book of Rules (2021), Article IV.E.5 — Bowhunter Unlimited',
        ruleCitation: 'Bowhunter unlimited rules and restrictions',
      },
      {
        code: 'FSC',
        name: 'Freestyle Limited Compound',
        descriptionEn: 'Compound with sight; mechanical release NOT allowed.',
        descriptionPt: 'Compound com mira; disparador mecânico NÃO permitido.',
        descriptionIt: 'Compound con mirino; sgancio meccanico NON consentito.',
        descriptionUk: 'Блочний лук з прицілом; механічний реліз НЕ дозволений.',
        descriptionEs: 'Arco compuesto con mira; disparador mecánico NO permitido.',
        ruleReference: 'IFAA Book of Rules (2021), Article IV.E.3 — Freestyle Limited',
        ruleCitation: 'Freestyle limited compound rules and restrictions',
      },
      {
        code: 'FSR',
        name: 'Freestyle Limited Recurve',
        descriptionEn: 'Recurve with sight; mechanical release NOT allowed.',
        descriptionPt: 'Recurvo com mira; disparador mecânico NÃO permitido.',
        descriptionIt: 'Ricurvo con mirino; sgancio meccanico NON consentito.',
        descriptionUk: 'Рекурсивний лук з прицілом; механічний реліз НЕ дозволений.',
        descriptionEs: 'Recurvo con mira; disparador mecánico NO permitido.',
        ruleReference: 'IFAA Book of Rules (2021), Article IV.E.3 — Freestyle Limited',
        ruleCitation: 'Freestyle limited recurve rules and restrictions',
      },
      {
        code: 'FU',
        name: 'Freestyle Unlimited',
        descriptionEn:
          'Any bow with sight and mechanical release permitted; full stabilization and modern accessories allowed.',
        descriptionPt:
          'Qualquer arco com mira e disparador mecânico permitido; estabilização completa e acessórios modernos autorizados.',
        descriptionIt:
          'Qualsiasi arco con mirino e sgancio meccanico consentito; piena stabilizzazione e accessori moderni ammessi.',
        descriptionUk:
          'Будь-який лук з прицілом і механічним релізом дозволений; повна стабілізація й сучасні аксесуари дозволені.',
        descriptionEs:
          'Cualquier arco con mira y disparador mecánico permitido; estabilización completa y accesorios modernos admitidos.',
        ruleReference: 'IFAA Book of Rules (2021), Article IV.E.2 — Freestyle Unlimited',
        ruleCitation: 'Freestyle unlimited rules and restrictions',
      },
      {
        code: 'HB',
        name: 'Historical Bow (IFAA)',
        descriptionEn:
          'Pre-1900 design using historically used materials (no carbon/fiberglass/epoxy); self or composite; polyester string allowed; wood arrows with feathers.',
        descriptionPt:
          'Design anterior a 1900 com materiais historicamente usados (sem carbono/fibra de vidro/epóxi); self ou composto; corda de poliéster permitida; flechas de madeira com penas.',
        descriptionIt:
          'Design pre-1900 con materiali storici (no carbonio/vetroresina/epossidica); self o composito; corda in poliestere consentita; frecce in legno con piume.',
        descriptionUk:
          "Дизайн до 1900 року з історичних матеріалів (без карбону/склопластику/епоксидки); суцільний або композит; дозволена поліестерова тетива; дерев'яні стріли з пір'ям.",
        descriptionEs:
          'Diseño anterior a 1900 con materiales históricamente utilizados (sin carbono/fibra de vidrio/epoxi); arco macizo o compuesto; cuerda de poliéster permitida; flechas de madera con plumas.',
        ruleReference: 'IFAA Book of Rules (2021), Article IV.E.8 — Historical Bow',
        ruleCitation: 'Historical bow rules and restrictions',
      },
      {
        code: 'HBM',
        name: 'Historical Bow — Modern Materials',
        descriptionEn:
          'Historical bow form using modern materials (e.g., fiberglass, modern adhesives); no shelf/window; arrow off hand; no overdraw.',
        descriptionPt:
          'Forma histórica com materiais modernos (p.ex., fibra de vidro, adesivos modernos); sem prateleira/janela; flecha sobre a mão; sem overdraw.',
        descriptionIt:
          'Arco storico con materiali moderni (es. vetroresina, adesivi moderni); senza shelf/finestra; freccia sulla mano; niente overdraw.',
        descriptionUk:
          'Історична форма лука з сучасних матеріалів (склопластик, сучасні клеї); без полички/вікна; стріла по руці; без overdraw.',
        descriptionEs:
          'Forma histórica del arco con materiales modernos (p. ej., fibra de vidrio, adhesivos modernos); sin repisa/ventana; flecha sobre la mano; sin overdraw.',
        ruleReference:
          'HDH-IAA Rules of Historical Archery (2025), §8.3.1 — Historical bow made of modern materials',
        ruleCitation: 'Historical bow modern materials rules',
      },
      {
        code: 'HBN',
        name: 'Historical Bow — Natural Materials',
        descriptionEn:
          'Historical bow form from natural materials only (wood, horn, bone, tendon, bamboo); carved/natural nocks; no shelf/window; arrow off hand; authenticity certification.',
        descriptionPt:
          'Forma histórica apenas com materiais naturais (madeira, chifre, osso, tendão, bambu); nocks esculpidos/naturais; sem prateleira/janela; flecha sobre a mão; certificação de autenticidade.',
        descriptionIt:
          'Arco storico solo con materiali naturali (legno, corno, osso, tendine, bambù); cocche intagliate/naturali; senza shelf/finestra; freccia sulla mano; certificazione di autenticità.',
        descriptionUk:
          'Історична форма лише з природних матеріалів (дерево, ріг, кістка, сухожилля, бамбук); вирізні/натуральні ноки; без полички/вікна; стріла по руці; сертифікація автентичності.',
        descriptionEs:
          'Forma histórica del arco solo con materiales naturales (madera, cuerno, hueso, tendón, bambú); culatines tallados/naturales; sin repisa/ventana; flecha sobre la mano; certificación de autenticidad.',
        ruleReference:
          'HDH-IAA Rules of Historical Archery (2025), §8.3.2 — Historical bow made of natural materials',
        ruleCitation: 'Historical bow natural materials rules',
      },
      {
        code: 'HBR',
        name: 'Historical Bow Recurve',
        descriptionEn:
          'Recurve–reflex (horse/nomad) primarily of natural materials; may include laminations of modern fibers; no shooting window. Allowed releases: Mediterranean, 3-under, thumb ring. No face-walking or string-walking. Wood/bamboo arrows with natural feathers; horn/bone/metal/wood/self nocks; arrows similar in length (±25 mm), diameter, fletching and points; no sighting marks on arrows.',
        descriptionPt:
          'Recurvo–reflexo (cavalo/nómada) sobretudo de materiais naturais; pode incluir laminações de fibras modernas; sem janela de tiro. Liberações: Mediterrâneo, 3-embaixo, anel de polegar. Sem face-walking ou string-walking. Setas de madeira/bambu com penas naturais; nocks em chifre/osso/metal/madeira/self; setas semelhantes em comprimento (±25 mm), diâmetro, penas e pontas; sem marcas de mira nas setas.',
        descriptionIt:
          'Ricurvo–reflex (cavallo/nomade) principalmente in materiali naturali; può includere laminazioni di fibre moderne; senza finestra di tiro. Rilasci: Mediterraneo, 3-sotto, anello da pollice. Vietato face-walking e string-walking. Frecce in legno/bambù con piume naturali; cocche in corno/osso/metallo/legno/self; frecce simili in lunghezza (±25 mm), diametro, piume e punte; nessun segno di mira sulle frecce.',
        descriptionUk:
          "Рекурсивно-рефлексний (кінний/кочовий) переважно з натуральних матеріалів; можливі ламінати з сучасних волокон; без вікна. Дозволені: середземноморський, 3-під, кільце на великому пальці. Заборонено face-walking і string-walking. Стріли з дерева/бамбуку з натуральним оперенням; врізні/рогові/кістяні/металеві/дерев'яні nock'и; стріли подібні за довжиною (±25 мм), діаметром, оперенням і наконечниками; без прицільних міток.",
        descriptionEs:
          'Recurvo–réflex (de caballo/nómada) principalmente de materiales naturales; puede incluir laminados de fibras modernas; sin ventana de tiro. Liberaciones permitidas: mediterránea, tres por debajo, anillo de pulgar. Prohibido el face-walking y el string-walking. Flechas de madera/bambú con plumas naturales; culatines de cuerno/hueso/metal/madera o tallados; flechas similares en longitud (±25 mm), diámetro, emplumado y puntas; sin marcas de puntería en las flechas.',
        ruleReference: 'FABP QC2026, Art. 27 — Campeonato dos Castelos B.1 (HBR)',
        ruleCitation: 'Historical bow recurve rules',
      },
      {
        code: 'HCB',
        name: 'Historical Crossbow',
        descriptionEn:
          'Historical-shaped crossbow; wooden stock; ≤110 lb; historical mechanisms only (no modern triggers/sights); handheld (no stand/support). Arrow longer than rest; point protrudes.',
        descriptionPt:
          'Besta de forma histórica; coronha em madeira; ≤110 lb; apenas mecanismos históricos (sem gatilhos/miras modernas); de mão (sem apoio/suporte). Virote mais longo que o apoio; ponta saliente.',
        descriptionIt:
          'Balestra di forma storica; calcio in legno; ≤110 lb; solo meccanismi storici (no grilletti/mirini moderni); a mano (senza appoggio/supporto). Freccia più lunga del rest; punta sporgente.',
        descriptionUk:
          "Арбалет історичної форми; дерев'яне ложе; ≤110 lb; лише історичні механізми (без сучасних спусків/прицілів); утримується в руках (без упора/штатива). Стріла довша за упор; вістря виступає.",
        descriptionEs:
          'Ballesta de forma histórica; culata de madera; ≤110 lb; solo mecanismos históricos (sin gatillos/visores modernos); a mano (sin soporte). Saeta más larga que el apoyo; la punta sobresale.',
        ruleReference: 'HDH-IAA Rules of Historical Archery (2025), §8.3.5 — Historical crossbows',
        ruleCitation: 'Historical crossbow rules',
      },
      {
        code: 'HLB',
        name: 'Historical Longbow / Stick Bow',
        descriptionEn:
          '≥135 cm; one-piece or 2-part at handle; continuous limb curve; no pistol grip/shelf/window; arrow off hand; no overdraw.',
        descriptionPt:
          '≥135 cm; peça única ou 2 partes unidas no punho; curvatura contínua; sem punho tipo pistola/prateleira/janela; flecha sobre a mão; sem overdraw.',
        descriptionIt:
          "≥135 cm; monopezzo o 2 parti unite all'impugnatura; curva continua; niente impugnatura a pistola/shelf/finestra; freccia sulla mano; niente overdraw.",
        descriptionUk:
          "≥135 см; цілісний або 2 частини в руків'ї; безперервна кривизна; без пістолетної рукояті/полички/вікна; стріла по руці; без overdraw.",
        descriptionEs:
          '≥135 cm; de una pieza o 2 piezas unidas en la empuñadura; curvatura continua; sin empuñadura tipo pistola/repisa/ventana; flecha sobre la mano; sin overdraw.',
        ruleReference:
          'HDH-IAA Rules of Historical Archery (2025), §8.3.3 — Historical longbows and other stick bows',
        ruleCitation: 'Historical longbow/stick bow rules',
      },
      {
        code: 'LB',
        name: 'Longbow',
        descriptionEn:
          'One-piece or two-piece joined at handle; continuous limb curve; shelf/window permitted (not past center); no sights/stabilizers; wood arrows.',
        descriptionPt:
          'Peça única ou duas peças unidas no punho; curvatura contínua; prateleira/janela permitida (não além do centro); sem miras/estabilizadores; flechas de madeira.',
        descriptionIt:
          "Monopezzo o due pezzi uniti all'impugnatura; curva continua; shelf/finestra consentiti (non oltre il centro); senza mirini/stabilizzatori; frecce in legno.",
        descriptionUk:
          "Цілісний або з двох частин, з'єднаних у руків'ї; безперервна кривизна; поличка/вікно дозволені (не далі центру); без прицілів/стабілізаторів; дерев'яні стріли.",
        descriptionEs:
          'Una pieza o dos piezas unidas en la empuñadura; curva continua de las palas; repisa/ventana permitida (no más allá del centro); sin miras/estabilizadores; flechas de madera.',
        ruleReference: 'IFAA Book of Rules (2021), Article IV.E.7 — Longbow',
        ruleCitation: 'Longbow rules and restrictions',
      },
      {
        code: 'HLB',
        name: 'Historical Longbow',
        descriptionEn:
          'English longbows, war bows, Victorian target bows, primitive bows and selfbows in natural materials only, modelled on bows that existed by 1900. No modern fibers, no shooting window. Wood or bamboo arrows with natural feathers; nocks of horn, bone, metal, wood, or self-nocks. Mediterranean draw.',
        descriptionPt:
          'Longbows ingleses, war bows, arcos vitorianos de alvo, arcos primitivos e selfbows só em materiais naturais, inspirados em arcos existentes até 1900. Sem fibras modernas e sem janela. Flechas de madeira ou bambu com penas naturais; nocks em corno, osso, metal, madeira ou self-nocks. Puxada mediterrânica.',
        descriptionIt:
          'Longbow inglesi, war bow, archi vittoriani da bersaglio, archi primitivi e selfbow solo in materiali naturali, sul modello di archi esistenti entro il 1900. Niente fibre moderne e niente finestra. Frecce in legno o bambù con piume naturali; cocche in corno, osso, metallo, legno o self-nock. Sgancio mediterraneo.',
        descriptionUk:
          'Англійські лонгбоу, war bow, вікторіанські мішеневі луки, примітивні та суцільні луки лише з природних матеріалів, за зразками до 1900 року. Без сучасних волокон і без вікна. Стріли з дерева або бамбука з натуральним оперенням; ноки з рогу, кістки, металу, дерева або self-nock. Середземноморський хват.',
        descriptionEs:
          'Longbows ingleses, war bows, arcos victorianos de diana, arcos primitivos y selfbows solo de materiales naturales, inspirados en arcos existentes hasta 1900. Sin fibras modernas y sin ventana. Flechas de madera o bambú con plumas naturales; culatines de cuerno, hueso, metal, madera o self-nock. Liberación mediterránea.',
        ruleReference: 'FABP QC2026, Art. 27 — Campeonato dos Castelos A (HLB)',
        ruleCitation: 'Historical longbow for Campeonato dos Castelos',
      },
      {
        code: 'MB-LB',
        name: 'Modern Longbow',
        descriptionEn:
          'American flatbow / modern longbow. Wood-based, one or two piece, usually laminated, with modern fibers such as fiberglass or carbon. Shooting window optional. Wood or bamboo arrows with natural feathers; non-fluorescent plastic nocks allowed.',
        descriptionPt:
          'American flatbow / longbow moderno. Base de madeira, uma ou duas peças, normalmente laminado, com fibras modernas (fibra de vidro ou carbono). Janela de disparo opcional. Flechas de madeira ou bambu com penas naturais; nocks de plástico não fluorescentes permitidos.',
        descriptionIt:
          'American flatbow / longbow moderno. Base in legno, uno o due pezzi, di solito laminato, con fibre moderne (vetroresina o carbonio). Finestra di tiro facoltativa. Frecce in legno o bambù con piume naturali; cocche in plastica non fluorescenti ammesse.',
        descriptionUk:
          'American flatbow / сучасний лонгбоу. Дерев’яна основа, одна або дві частини, зазвичай ламінований, із сучасними волокнами (склопластик або карбон). Вікно необов’язкове. Стріли з дерева або бамбука з натуральним оперенням; нефлуоресцентні пластикові ноки дозволені.',
        descriptionEs:
          'American flatbow / longbow moderno. Base de madera, de una o dos piezas, normalmente laminado, con fibras modernas (fibra de vidrio o carbono). Ventana de tiro opcional. Flechas de madera o bambú con plumas naturales; culatines de plástico no fluorescentes permitidos.',
        ruleReference: 'FABP QC2026, Art. 27 — Campeonato dos Castelos C (MB LB)',
        ruleCitation: 'Modern longbow for Campeonato dos Castelos',
      },
      {
        code: 'MB-TR',
        name: 'Modern Traditional Recurve',
        descriptionEn:
          'Traditional reflex-deflex recurve, one piece or two-piece takedown. Wood-based, modern fibers allowed. Shooting window optional. Wood or bamboo arrows with natural feathers; non-fluorescent plastic nocks allowed.',
        descriptionPt:
          'Recurvo tradicional reflexo-deflexo, uma peça ou take-down de duas peças. Base de madeira, fibras modernas permitidas. Janela de disparo opcional. Flechas de madeira ou bambu com penas naturais; nocks de plástico não fluorescentes permitidos.',
        descriptionIt:
          'Ricurvo tradizionale reflex-deflex, monopezzo o takedown in due pezzi. Base in legno, fibre moderne ammesse. Finestra di tiro facoltativa. Frecce in legno o bambù con piume naturali; cocche in plastica non fluorescenti ammesse.',
        descriptionUk:
          'Традиційний рекурсив reflex-deflex, суцільний або takedown із двох частин. Дерев’яна основа, сучасні волокна дозволені. Вікно необов’язкове. Стріли з дерева або бамбука з натуральним оперенням; нефлуоресцентні пластикові ноки дозволені.',
        descriptionEs:
          'Recurvo tradicional reflex-deflex, de una pieza o takedown de dos piezas. Base de madera, fibras modernas permitidas. Ventana de tiro opcional. Flechas de madera o bambú con plumas naturales; culatines de plástico no fluorescentes permitidos.',
        ruleReference: 'FABP QC2026, Art. 27 — Campeonato dos Castelos D (MB TR)',
        ruleCitation: 'Modern traditional recurve for Campeonato dos Castelos',
      },
      {
        code: 'MBR',
        name: 'Modern Bow Recurve',
        descriptionEn:
          'Horse/nomad-style recurve–reflex built entirely from modern materials (fiberglass, carbon, synthetics), one or two piece, no shooting window. Releases: Mediterranean, 3-under, thumb ring. Wood/bamboo arrows with natural feathers; horn/bone/metal/wood/self nocks.',
        descriptionPt:
          'Recurvo–reflexo estilo cavalo/nómada fabricado integralmente com materiais modernos (fibra de vidro, carbono, sintéticos), uma ou duas peças, sem janela de disparo. Liberações: Mediterrâneo, 3-embaixo, anel de polegar. Flechas de madeira/bambu com penas naturais; nocks em corno/osso/metal/madeira/self.',
        descriptionIt:
          'Ricurvo–reflex stile cavallo/nomade interamente in materiali moderni (vetroresina, carbonio, sintetici), uno o due pezzi, senza finestra. Rilasci: Mediterraneo, 3-sotto, anello da pollice. Frecce in legno/bambù con piume naturali; cocche in corno/osso/metallo/legno/self.',
        descriptionUk:
          'Рекурсивно-рефлексний кінний/кочовий стиль повністю з сучасних матеріалів (склопластик, карбон, синтетика), одна або дві частини, без вікна. Хват: середземноморський, 3-під, кільце. Стріли з дерева/бамбука з натуральним оперенням; ноки з рогу/кістки/металу/дерева/self.',
        descriptionEs:
          'Recurvo–réflex estilo caballo/nómada fabricado íntegramente con materiales modernos (fibra de vidro, carbono, sintéticos), de una o dos piezas, sin ventana. Liberaciones: mediterránea, tres por debajo, anillo de pulgar. Flechas de madera/bambú con plumas naturales; culatines de cuerno/hueso/metal/madera/self.',
        ruleReference: 'FABP QC2026, Art. 27 — Campeonato dos Castelos B.2 (MBR)',
        ruleCitation: 'Modern bow recurve for Campeonato dos Castelos',
      },
      {
        code: 'MC',
        name: 'Medieval Crossbow',
        descriptionEn: 'FABP medieval (historical-style) crossbow discipline; unisex category.',
        descriptionPt: 'Besta medieval (estilo histórico) da FABP; categoria unissexo.',
        descriptionIt: 'Balestra medievale (stile storico) FABP; categoria unisex.',
        descriptionUk: 'Середньовічний (історичний) арбалет FABP; унісекс категорія.',
        descriptionEs: 'Ballesta medieval (estilo histórico) de la FABP; categoría unisex.',
        ruleReference: 'FABP QC2026, Art. 27 — Campeonato dos Castelos E (MC)',
        ruleCitation: 'Medieval crossbow rules',
      },
      {
        code: 'SC-Fs',
        name: 'Sport Crossbow Freestyle',
        descriptionEn: 'FABP sport crossbow — freestyle configuration; unisex category.',
        descriptionPt: 'Besta desportiva FABP — configuração freestyle; categoria unissexo.',
        descriptionIt: 'Balestra sportiva FABP — configurazione freestyle; categoria unisex.',
        descriptionUk: 'Спортивний арбалет FABP — конфігурація freestyle; унісекс категорія.',
        descriptionEs: 'Ballesta deportiva de la FABP — configuración freestyle; categoría unisex.',
        ruleReference:
          'FABP QC2026, Art. 8.2 — Categorias Crossbow Unissexo (SC-St, SC-Fs, TC, MC)',
        ruleCitation: 'Sport crossbow freestyle rules',
      },
      {
        code: 'SC-St',
        name: 'Sport Crossbow Standard',
        descriptionEn: 'FABP sport crossbow — standard configuration; unisex category.',
        descriptionPt: 'Besta desportiva FABP — configuração standard; categoria unissexo.',
        descriptionIt: 'Balestra sportiva FABP — configurazione standard; categoria unisex.',
        descriptionUk: 'Спортивний арбалет FABP — стандартна конфігурація; унісекс категорія.',
        descriptionEs: 'Ballesta deportiva de la FABP — configuración estándar; categoría unisex.',
        ruleReference:
          'FABP QC2026, Art. 8.2 — Categorias Crossbow Unissexo (SC-St, SC-Fs, TC, MC)',
        ruleCitation: 'Sport crossbow standard rules',
      },
      {
        code: 'TC',
        name: 'Target Crossbow',
        descriptionEn: 'FABP target crossbow discipline; unisex category.',
        descriptionPt: 'Disciplina de besta de alvo da FABP; categoria unissexo.',
        descriptionIt: 'Disciplina di balestra da bersaglio FABP; categoria unisex.',
        descriptionUk: 'Дисципліна арбалет «таргет» у FABP; унісекс категорія.',
        descriptionEs: 'Disciplina de ballesta de diana de la FABP; categoría unissex.',
        ruleReference:
          'FABP QC2026, Art. 8.2 — Categorias Crossbow Unissexo (SC-St, SC-Fs, TC, MC)',
        ruleCitation: 'Target crossbow rules',
      },
      {
        code: 'TR',
        name: 'Traditional Recurve',
        descriptionEn:
          'Wood riser (may be laminated); wood-core limbs with glass/carbon laminates allowed; shot off shelf/hand; no rest/sight/stabilizers.',
        descriptionPt:
          'Punho de madeira (pode ser laminado); lâminas com núcleo de madeira e laminados de vidro/carbono permitidos; tiro da prateleira/mão; sem descanso/mira/estabilizadores.',
        descriptionIt:
          'Riser in legno (anche laminato); flettenti con anima in legno e laminazioni in vetro/carbonio consentite; tiro dallo shelf/dalla mano; senza rest/mirino/stabilizzatori.',
        descriptionUk:
          "Рукоять із дерева (може бути ламінована); плечі з дерев'яним осердям і ламінатами зі скла/карбону дозволені; стрільба зі полички/з руки; без rest/прицілів/стабілізаторів.",
        descriptionEs:
          'Empuñadura de madera (puede ser laminada); palas con núcleo de madera y laminados de fibra de vidrio/carbono permitidos; disparo desde la repisa o mano; sin reposaflechas/mira/estabilizadores.',
        ruleReference: 'IFAA Book of Rules (2021), Article IV.E.9 — Traditional Recurve',
        ruleCitation: 'Traditional recurve rules and restrictions',
      },
      {
        code: 'TWR',
        name: 'Traditional Bow with Window/Arrow Rest',
        descriptionEn:
          'Recurve/longbow/self bow with wooden handle; window and shelf allowed; simple arrow rest (fur/leather) allowed; ILF not permitted; dampers allowed; no overdraw.',
        descriptionPt:
          'Recurvo/longbow/self com punho de madeira; janela e prateleira permitidas; descanso simples (pelo/couro) permitido; ILF não permitido; amortecedores permitidos; sem overdraw.',
        descriptionIt:
          'Ricurvo/longbow/self con impugnatura in legno; finestra e shelf consentite; rest semplice (pelo/cuoio) consentito; ILF non consentito; ammortizzatori ammessi; niente overdraw.',
        descriptionUk:
          "Рекурсивний/лонгбоу/селф-лук із дерев'яним руків'ям; вікно і поличка дозволені; простий rest (хутро/шкіра) дозволений; ILF заборонено; демпфери дозволені; без overdraw.",
        descriptionEs:
          'Recurvo/longbow/self con empuñadura de madera; se permiten ventana y repisa; reposaflechas simple (piel/cuero) permitido; ILF no permitido; amortiguadores permitidos; sin overdraw.',
        ruleReference:
          'HDH-IAA Rules of Historical Archery (2025), §8.3.4 — Traditional bow with a window or arrow rest',
        ruleCitation: 'Traditional bow with window/rest rules',
      },
    ];

    let created = 0;

    for (const catData of bowCategories) {
      const rule = pickRule(catData.ruleReference, ifaaRule, fabpRule, hdhRule);
      const result = await ensureCategory(em, catData, rule);
      if (result) {
        created++;
        console.log(`  ✅ ${result.code} under ${rule.ruleCode}`);
      }

      // FABP accepts all IFAA categories per QC2026 Art. 8
      if (fabpRule && rule.ruleCode === 'IFAA' && IFAA_CATEGORY_CODES.has(catData.code)) {
        const fabpDuplicate = {
          ...catData,
          ruleReference: 'FABP QC2026, Art. 8 — IFAA classes accepted',
        };
        const fabpResult = await ensureCategory(em, fabpDuplicate, fabpRule);
        if (fabpResult) {
          created++;
          console.log(`  ✅ ${fabpResult.code} under ${fabpRule.ruleCode}`);
        }
      }
    }

    const targetDivisions: CategoryData[] = [
      {
        code: 'RC',
        name: 'Recurve',
        descriptionEn:
          'World Archery Recurve division. Sight, stabilisers, and a clicker are permitted.',
        descriptionPt:
          'Divisão Recurvo da World Archery. Mira, estabilizadores e clicker são permitidos.',
        descriptionIt:
          'Divisione Ricurvo World Archery. Mirino, stabilizzatori e clicker sono consentiti.',
        descriptionUk: 'Дивізіон Recurve World Archery. Приціл, стабілізатори та клікер дозволені.',
        descriptionEs:
          'División Recurvo de World Archery. Se permiten mira, estabilizadores y clicker.',
        ruleReference: 'World Archery Book 3 (2026), 9.1 — Recurve Division',
        ruleCitation: 'Recurve division equipment',
      },
      {
        code: 'CP',
        name: 'Compound',
        descriptionEn:
          'World Archery Compound division. Release aid, scope, and peep sight are permitted.',
        descriptionPt:
          'Divisão Compound da World Archery. Disparador, scope e peep sight são permitidos.',
        descriptionIt:
          'Divisione Compound World Archery. Sgancio meccanico, scope e peep sight sono consentiti.',
        descriptionUk: 'Дивізіон Compound World Archery. Реліз, scope і peep sight дозволені.',
        descriptionEs:
          'División Compound de World Archery. Se permiten disparador, scope y peep sight.',
        ruleReference: 'World Archery Book 3 (2026), 9.2 — Compound Division',
        ruleCitation: 'Compound division equipment',
      },
      {
        code: 'BB',
        name: 'Barebow',
        descriptionEn:
          'World Archery Barebow division. Recurve equipment without a sight or stabilisers.',
        descriptionPt:
          'Divisão Barebow da World Archery. Equipamento de recurvo sem mira nem estabilizadores.',
        descriptionIt:
          'Divisione Barebow World Archery. Attrezzatura da ricurvo senza mirino né stabilizzatori.',
        descriptionUk:
          'Дивізіон Barebow World Archery. Рекурсивне спорядження без прицілу та стабілізаторів.',
        descriptionEs:
          'División Barebow de World Archery. Equipo de recurvo sin mira ni estabilizadores.',
        ruleReference: 'World Archery Book 3 (2026), 9.3 — Barebow Division',
        ruleCitation: 'Barebow division equipment',
      },
    ];

    for (const ruleCode of ['FPTA', 'WA', 'WA-INDOOR']) {
      const rule = await em.findOne(Rule, { ruleCode });
      if (!rule) {
        console.log(`   ⚠️  Rule ${ruleCode} not found, skipping target divisions`);
        continue;
      }
      for (const catData of targetDivisions) {
        const reference =
          ruleCode === 'FPTA'
            ? 'FPTA Quadros Competitivos (fev. 2026), Art. 5 — Recurvo, Compound e Barebow'
            : catData.ruleReference;
        const result = await ensureCategory(em, { ...catData, ruleReference: reference }, rule);
        if (result) {
          created++;
          console.log(`  ✅ ${result.code} under ${rule.ruleCode}`);
        }
      }
    }

    console.log(`✅ ${created} Bow Categories created`);
  }
}
