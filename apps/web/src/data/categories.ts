import type { CategoryDto } from '../services/types';

/**
 * FE-only seed data for bow categories, used until the backend is ready.
 * Extend freely during development; URLs for rule citations will point to /rules#<citation>.
 */
const categoriesData: CategoryDto[] = [
  {
    "code": "FU",
    "name": "Freestyle Unlimited",
    "description_en": "Any bow with sight and mechanical release permitted; full stabilization and modern accessories allowed.",
    "description_pt": "Qualquer arco com mira e disparador mecânico permitido; estabilização completa e acessórios modernos autorizados.",
    "description_it": "Qualsiasi arco con mirino e sgancio meccanico consentito; piena stabilizzazione e accessori moderni ammessi.",
    "description_uk": "Будь-який лук з прицілом і механічним релізом дозволений; повна стабілізація й сучасні аксесуари дозволені.",
    "description_es": "Cualquier arco con mira y disparador mecánico permitido; estabilización completa y accesorios modernos admitidos.",
    "rule_reference": "IFAA",
    "rule_citation": "IFAA Book of Rules (2021), Article IV.E.2 — Freestyle Unlimited"
  },
  {
    "code": "FSC",
    "name": "Freestyle Limited Compound",
    "description_en": "Compound with sight; mechanical release NOT allowed.",
    "description_pt": "Compound com mira; disparador mecânico NÃO permitido.",
    "description_it": "Compound con mirino; sgancio meccanico NON consentito.",
    "description_uk": "Блочний лук з прицілом; механічний реліз НЕ дозволений.",
    "description_es": "Arco compuesto con mira; disparador mecánico NO permitido.",
    "rule_reference": "IFAA",
    "rule_citation": "IFAA Book of Rules (2021), Article IV.E.3 — Freestyle Limited"
  },
  {
    "code": "FSR",
    "name": "Freestyle Limited Recurve",
    "description_en": "Recurve with sight; mechanical release NOT allowed.",
    "description_pt": "Recurvo com mira; disparador mecânico NÃO permitido.",
    "description_it": "Ricurvo con mirino; sgancio meccanico NON consentito.",
    "description_uk": "Рекурсивний лук з прицілом; механічний реліз НЕ дозволений.",
    "description_es": "Recurvo con mira; disparador mecánico NO permitido.",
    "rule_reference": "IFAA",
    "rule_citation": "IFAA Book of Rules (2021), Article IV.E.3 — Freestyle Limited"
  },
  {
    "code": "BU",
    "name": "Bowhunter Unlimited",
    "description_en": "4–5 fixed-pin sight; release aid allowed; peep OR kisser (not both); limited stabilizer; no scopes.",
    "description_pt": "Mira de 4–5 pinos fixos; disparador permitido; peep OU kisser (não ambos); estabilizador limitado; sem lunetas.",
    "description_it": "Mirino a 4–5 pin fissi; sgancio consentito; peep OPPURE kisser (non entrambi); stabilizzatore limitato; niente lenti/scope.",
    "description_uk": "Приціл із 4–5 фіксованими пінами; реліз дозволено; peep АБО kisser (не обидва); обмежений стабілізатор; без оптики.",
    "description_es": "Mira de 4–5 pines fijos; disparador permitido; peep o kisser (no ambos); estabilizador limitado; sin lentes/visores ópticos.",
    "rule_reference": "IFAA",
    "rule_citation": "IFAA Book of Rules (2021), Article IV.E.5 — Bowhunter Unlimited"
  },
  {
    "code": "BL",
    "name": "Bowhunter Limited",
    "description_en": "As Bowhunter Unlimited but shot with fingers only; no mechanical release.",
    "description_pt": "Como Bowhunter Unlimited mas apenas com dedos; sem disparador mecânico.",
    "description_it": "Come Bowhunter Unlimited ma solo con le dita; nessuno sgancio meccanico.",
    "description_uk": "Як Bowhunter Unlimited, але стрільба тільки пальцями; без механічного релізу.",
    "description_es": "Como Bowhunter Unlimited pero disparando solo con los dedos; sin disparador mecánico.",
    "rule_reference": "IFAA",
    "rule_citation": "IFAA Book of Rules (2021), Article IV.E.6 — Bowhunter Limited"
  },
  {
    "code": "BBR",
    "name": "Barebow Recurve",
    "description_en": "Recurve without sights; single nocking point; optional non-adjustable draw check/level below arrow; stabilizers allowed.",
    "description_pt": "Recurvo sem miras; um ponto de encordoamento; verificador/nível não ajustável opcional abaixo da flecha; estabilizadores permitidos.",
    "description_it": "Ricurvo senza mirini; un punto di incocco; controllo/livella non regolabile opzionale sotto la freccia; stabilizzatori ammessi.",
    "description_uk": "Рекурсивний без прицілів; одна точка накладання; необов’язковий нерегульований індикатор/рівень під стрілою; стабілізатори дозволені.",
    "description_es": "Recurvo sin miras; un único punto de nock; comprobador o nivel no ajustable opcional bajo la flecha; estabilizadores permitidos.",
    "rule_reference": "IFAA",
    "rule_citation": "IFAA Book of Rules (2021), Article IV.E.1 — Barebow (Recurve)"
  },
  {
    "code": "BBC",
    "name": "Barebow Compound",
    "description_en": "Compound without sights; single nocking point; draw stops allowed; stabilizers allowed.",
    "description_pt": "Compound sem miras; um ponto de encordoamento; batentes de tração permitidos; estabilizadores permitidos.",
    "description_it": "Compound senza mirini; un punto di incocco; fine corsa consentiti; stabilizzatori ammessi.",
    "description_uk": "Блочний без прицілів; одна точка накладання; упори натягу дозволені; стабілізатори дозволені.",
    "description_es": "Compuesto sin miras; un único punto de nock; topes de apertura permitidos; estabilizadores permitidos.",
    "rule_reference": "IFAA",
    "rule_citation": "IFAA Book of Rules (2021), Article IV.E.1 — Barebow (Compound)"
  },
  {
    "code": "BHR",
    "name": "Bowhunter Recurve",
    "description_en": "Recurve shot with fingers; no sights/peep/kisser/level; one straight stabilizer (length-limited).",
    "description_pt": "Recurvo disparado com dedos; sem miras/peep/kisser/nível; um estabilizador reto (comprimento limitado).",
    "description_it": "Ricurvo con tiro a dita; senza mirini/peep/kisser/livella; un solo stabilizzatore dritto (lunghezza limitata).",
    "description_uk": "Рекурсивний, стрільба пальцями; без прицілів/peep/kisser/рівня; один прямий стабілізатор (обмеженої довжини).",
    "description_es": "Recurvo disparado con los dedos; sin miras/peep/kisser/nivel; un estabilizador recto (longitud limitada).",
    "rule_reference": "IFAA",
    "rule_citation": "IFAA Book of Rules (2021), Article IV.E.4 — Bowhunter (Recurve & Compound)"
  },
  {
    "code": "BHC",
    "name": "Bowhunter Compound",
    "description_en": "Compound shot with fingers; no sights/peep/level; one straight stabilizer (length-limited); draw stops allowed.",
    "description_pt": "Compound disparado com dedos; sem miras/peep/nível; um estabilizador reto (comprimento limitado); batentes de tração permitidos.",
    "description_it": "Compound con tiro a dita; senza mirini/peep/livella; un solo stabilizzatore dritto (lunghezza limitata); fine corsa consentiti.",
    "description_uk": "Блочний, стрільба пальцями; без прицілів/peep/рівня; один прямий стабілізатор (обмеженої довжини); упори натягу дозволені.",
    "description_es": "Compuesto disparado con los dedos; sin miras/peep/nivel; un estabilizador recto (longitud limitada); topes de apertura permitidos.",
    "rule_reference": "IFAA",
    "rule_citation": "IFAA Book of Rules (2021), Article IV.E.4 — Bowhunter (Recurve & Compound)"
  },
  {
    "code": "TR",
    "name": "Traditional Recurve",
    "description_en": "Wood riser (may be laminated); wood-core limbs with glass/carbon laminates allowed; shot off shelf/hand; no rest/sight/stabilizers.",
    "description_pt": "Punho de madeira (pode ser laminado); lâminas com núcleo de madeira e laminados de vidro/carbono permitidos; tiro da prateleira/mão; sem descanso/mira/estabilizadores.",
    "description_it": "Riser in legno (anche laminato); flettenti con anima in legno e laminazioni in vetro/carbonio consentite; tiro dallo shelf/dalla mano; senza rest/mirino/stabilizzatori.",
    "description_uk": "Рукоять із дерева (може бути ламінована); плечі з дерев’яним осердям і ламінатами зі скла/карбону дозволені; стрільба зі полички/з руки; без rest/прицілів/стабілізаторів.",
    "description_es": "Empuñadura de madera (puede ser laminada); palas con núcleo de madera y laminados de fibra de vidrio/carbono permitidos; disparo desde la repisa o mano; sin reposaflechas/mira/estabilizadores.",
    "rule_reference": "IFAA",
    "rule_citation": "IFAA Book of Rules (2021), Article IV.E.9 — Traditional Recurve"
  },
  {
    "code": "LB",
    "name": "Longbow",
    "description_en": "One-piece or two-piece joined at handle; continuous limb curve; shelf/window permitted (not past center); no sights/stabilizers; wood arrows.",
    "description_pt": "Peça única ou duas peças unidas no punho; curvatura contínua; prateleira/janela permitida (não além do centro); sem miras/estabilizadores; flechas de madeira.",
    "description_it": "Monopezzo o due pezzi uniti all’impugnatura; curva continua; shelf/finestra consentiti (non oltre il centro); senza mirini/stabilizzatori; frecce in legno.",
    "description_uk": "Цілісний або з двох частин, з’єднаних у руків’ї; безперервна кривизна; поличка/вікно дозволені (не далі центру); без прицілів/стабілізаторів; дерев’яні стріли.",
    "description_es": "Una pieza o dos piezas unidas en la empuñadura; curva continua de las palas; repisa/ventana permitida (no más allá del centro); sin miras/estabilizadores; flechas de madera.",
    "rule_reference": "IFAA",
    "rule_citation": "IFAA Book of Rules (2021), Article IV.E.7 — Longbow"
  },
  {
    "code": "HB",
    "name": "Historical Bow (IFAA)",
    "description_en": "Pre-1900 design using historically used materials (no carbon/fiberglass/epoxy); self or composite; polyester string allowed; wood arrows with feathers.",
    "description_pt": "Design anterior a 1900 com materiais historicamente usados (sem carbono/fibra de vidro/epóxi); self ou composto; corda de poliéster permitida; flechas de madeira com penas.",
    "description_it": "Design pre-1900 con materiali storici (no carbonio/vetroresina/epossidica); self o composito; corda in poliestere consentita; frecce in legno con piume.",
    "description_uk": "Дизайн до 1900 року з історичних матеріалів (без карбону/склопластику/епоксидки); суцільний або композит; дозволена поліестерова тетива; дерев’яні стріли з пір’ям.",
    "description_es": "Diseño anterior a 1900 con materiales históricamente utilizados (sin carbono/fibra de vidrio/epoxi); arco macizo o compuesto; cuerda de poliéster permitida; flechas de madera con plumas.",
    "rule_reference": "IFAA",
    "rule_citation": "IFAA Book of Rules (2021), Article IV.E.8 — Historical Bow"
  },
  {
    "code": "HBR",
    "name": "Historical Bow Recurve",
    "description_en": "Recurve–reflex (horse/nomad) primarily of natural materials; may include laminations of modern fibers; no shooting window. Allowed releases: Mediterranean, 3-under, thumb ring. No face-walking or string-walking. Wood/bamboo arrows with natural feathers; horn/bone/metal/wood/self nocks; arrows similar in length (±25 mm), diameter, fletching and points; no sighting marks on arrows.",
    "description_pt": "Recurvo–reflexo (cavalo/nómada) sobretudo de materiais naturais; pode incluir laminações de fibras modernas; sem janela de tiro. Liberações: Mediterrâneo, 3-embaixo, anel de polegar. Sem face-walking ou string-walking. Setas de madeira/bambu com penas naturais; nocks em chifre/osso/metal/madeira/self; setas semelhantes em comprimento (±25 mm), diâmetro, penas e pontas; sem marcas de mira nas setas.",
    "description_it": "Ricurvo–reflex (cavallo/nomade) principalmente in materiali naturali; può includere laminazioni di fibre moderne; senza finestra di tiro. Rilasci: Mediterraneo, 3-sotto, anello da pollice. Vietato face-walking e string-walking. Frecce in legno/bambù con piume naturali; cocche in corno/osso/metallo/legno/self; frecce simili in lunghezza (±25 mm), diametro, piume e punte; nessun segno di mira sulle frecce.",
    "description_uk": "Рекурсивно-рефлексний (кінний/кочовий) переважно з натуральних матеріалів; можливі ламінати з сучасних волокон; без вікна. Дозволені: середземноморський, 3-під, кільце на великому пальці. Заборонено face-walking і string-walking. Стріли з дерева/бамбуку з натуральним оперенням; врізні/рогові/кістяні/металеві/дерев’яні nock’и; стріли подібні за довжиною (±25 мм), діаметром, оперенням і наконечниками; без прицільних міток.",
    "description_es": "Recurvo–réflex (de caballo/nómada) principalmente de materiales naturales; puede incluir laminados de fibras modernas; sin ventana de tiro. Liberaciones permitidas: mediterránea, tres por debajo, anillo de pulgar. Prohibido el face-walking y el string-walking. Flechas de madera/bambú con plumas naturales; culatines de cuerno/hueso/metal/madera o tallados; flechas similares en longitud (±25 mm), diámetro, emplumado y puntas; sin marcas de puntería en las flechas.",
    "rule_reference": "FABP",
    "rule_citation": "FABP QC2025 — Rota dos Castelos: 2.a) Histórico (HBR)"
  },
  {
    "code": "MBR",
    "name": "Modern Bow Recurve",
    "description_en": "Recurve–reflex built entirely from modern materials (e.g., fiberglass, carbon, synthetics), one or two piece. Same shooting rules as HBR (Mediterranean, 3-under, thumb ring); no face-walking or string-walking. Wood/bamboo arrows with natural feathers; traditional nocks allowed; arrows similar in length (±25 mm), diameter, fletching and points; no sighting marks on arrows.",
    "description_pt": "Recurvo–reflexo inteiramente em materiais modernos (fibra de vidro, carbono, sintéticos), uma ou duas peças. Mesmas regras de tiro do HBR (Mediterrâneo, 3-embaixo, anel de polegar); sem face-/string-walking. Setas de madeira/bambu com penas naturais; nocks tradicionais; setas semelhantes em comprimento (±25 mm), diâmetro, penas e pontas; sem marcas de mira nas setas.",
    "description_it": "Ricurvo–reflex interamente in materiali moderni (vetroresina, carbonio, sintetici), in uno o due pezzi. Stesse regole di tiro dell’HBR (Mediterraneo, 3-sotto, anello da pollice); vietato face-/string-walking. Frecce in legno/bambù con piume naturali; cocche tradizionali; frecce simili in lunghezza (±25 mm), diametro, piume e punte; nessun segno di mira sulle frecce.",
    "description_uk": "Рекурсивно-рефлексний повністю з сучасних матеріалів (склопластик, карбон, синтетика), одне або два коліна. Ті самі правила, що для HBR (середземноморський, 3-під, кільце); заборонено face-/string-walking. Дерев’яні/бамбукові стріли з натуральним оперенням; традиційні ноки; стріли однакові за довжиною (±25 мм), діаметром, оперенням і наконечниками; без прицільних міток.",
    "description_es": "Recurvo–réflex construido íntegramente con materiales modernos (fibra de vidrio, carbono, sintéticos), de una o dos piezas. Mismas reglas de tiro que HBR (mediterránea, tres por debajo, anillo de pulgar); prohibido el face-/string-walking. Flechas de madera/bambú con plumas naturales; culatines tradicionales permitidos; flechas similares en longitud (±25 mm), diámetro, emplumado y puntas; sin marcas de puntería.",
    "rule_reference": "FABP",
    "rule_citation": "FABP QC2025 — Rota dos Castelos: 2.b) Moderno (MBR)"
  },
  {
    "code": "SC-St",
    "name": "Sport Crossbow Standard",
    "description_en": "FABP sport crossbow — standard configuration; unisex category.",
    "description_pt": "Besta desportiva FABP — configuração standard; categoria unissexo.",
    "description_it": "Balestra sportiva FABP — configurazione standard; categoria unisex.",
    "description_uk": "Спортивний арбалет FABP — стандартна конфігурація; унісекс категорія.",
    "description_es": "Ballesta deportiva de la FABP — configuración estándar; categoría unisex.",
    "rule_reference": "FABP",
    "rule_citation": "FABP QC2025, Art. 8.2 — Categorias Crossbow Unissexo (SC-St, SC-Fs, TC, MC)"
  },
  {
    "code": "SC-Fs",
    "name": "Sport Crossbow Freestyle",
    "description_en": "FABP sport crossbow — freestyle configuration; unisex category.",
    "description_pt": "Besta desportiva FABP — configuração freestyle; categoria unissexo.",
    "description_it": "Balestra sportiva FABP — configurazione freestyle; categoria unisex.",
    "description_uk": "Спортивний арбалет FABP — конфігурація freestyle; унісекс категорія.",
    "description_es": "Ballesta deportiva de la FABP — configuración freestyle; categoría unisex.",
    "rule_reference": "FABP",
    "rule_citation": "FABP QC2025, Art. 8.2 — Categorias Crossbow Unissexo (SC-St, SC-Fs, TC, MC)"
  },
  {
    "code": "TC",
    "name": "Target Crossbow",
    "description_en": "FABP target crossbow discipline; unisex category.",
    "description_pt": "Disciplina de besta de alvo da FABP; categoria unissexo.",
    "description_it": "Disciplina di balestra da bersaglio FABP; categoria unisex.",
    "description_uk": "Дисципліна арбалет «таргет» у FABP; унісекс категорія.",
    "description_es": "Disciplina de ballesta de diana de la FABP; categoría unissex.",
    "rule_reference": "FABP",
    "rule_citation": "FABP QC2025, Art. 8.2 — Categorias Crossbow Unissexo (SC-St, SC-Fs, TC, MC)"
  },
  {
    "code": "MC",
    "name": "Medieval Crossbow",
    "description_en": "FABP medieval (historical-style) crossbow discipline; unisex category.",
    "description_pt": "Besta medieval (estilo histórico) da FABP; categoria unissexo.",
    "description_it": "Balestra medievale (stile storico) FABP; categoria unisex.",
    "description_uk": "Середньовічний (історичний) арбалет FABP; унісекс категорія.",
    "description_es": "Ballesta medieval (estilo histórico) de la FABP; categoría unisex.",
    "rule_reference": "FABP",
    "rule_citation": "FABP QC2025, Art. 8.2 — Categorias Crossbow Unissexo (SC-St, SC-Fs, TC, MC)"
  },
  {
    "code": "HBM",
    "name": "Historical Bow — Modern Materials",
    "description_en": "Historical bow form using modern materials (e.g., fiberglass, modern adhesives); no shelf/window; arrow off hand; no overdraw.",
    "description_pt": "Forma histórica com materiais modernos (p.ex., fibra de vidro, adesivos modernos); sem prateleira/janela; flecha sobre a mão; sem overdraw.",
    "description_it": "Arco storico con materiali moderni (es. vetroresina, adesivi moderni); senza shelf/finestra; freccia sulla mano; niente overdraw.",
    "description_uk": "Історична форма лука з сучасних матеріалів (склопластик, сучасні клеї); без полички/вікна; стріла по руці; без overdraw.",
    "description_es": "Forma histórica del arco con materiales modernos (p. ej., fibra de vidrio, adhesivos modernos); sin repisa/ventana; flecha sobre la mano; sin overdraw.",
    "rule_reference": "HDH-IAA",
    "rule_citation": "HDH-IAA Rules of Historical Archery (2025), §8.3.1 — Historical bow made of modern materials"
  },
  {
    "code": "HBN",
    "name": "Historical Bow — Natural Materials",
    "description_en": "Historical bow form from natural materials only (wood, horn, bone, tendon, bamboo); carved/natural nocks; no shelf/window; arrow off hand; authenticity certification.",
    "description_pt": "Forma histórica apenas com materiais naturais (madeira, chifre, osso, tendão, bambu); nocks esculpidos/naturais; sem prateleira/janela; flecha sobre a mão; certificação de autenticidade.",
    "description_it": "Arco storico solo con materiali naturali (legno, corno, osso, tendine, bambù); cocche intagliate/naturali; senza shelf/finestra; freccia sulla mano; certificazione di autenticità.",
    "description_uk": "Історична форма лише з природних матеріалів (дерево, ріг, кістка, сухожилля, бамбук); вирізні/натуральні ноки; без полички/вікна; стріла по руці; сертифікація автентичності.",
    "description_es": "Forma histórica del arco solo con materiales naturales (madera, cuerno, hueso, tendón, bambú); culatines tallados/naturales; sin repisa/ventana; flecha sobre la mano; certificación de autenticidad.",
    "rule_reference": "HDH-IAA",
    "rule_citation": "HDH-IAA Rules of Historical Archery (2025), §8.3.2 — Historical bow made of natural materials"
  },
  {
    "code": "HLB",
    "name": "Historical Longbow / Stick Bow",
    "description_en": "≥135 cm; one-piece or 2-part at handle; continuous limb curve; no pistol grip/shelf/window; arrow off hand; no overdraw.",
    "description_pt": "≥135 cm; peça única ou 2 partes unidas no punho; curvatura contínua; sem punho tipo pistola/prateleira/janela; flecha sobre a mão; sem overdraw.",
    "description_it": "≥135 cm; monopezzo o 2 parti unite all’impugnatura; curva continua; niente impugnatura a pistola/shelf/finestra; freccia sulla mano; niente overdraw.",
    "description_uk": "≥135 см; цілісний або 2 частини в руків’ї; безперервна кривизна; без пістолетної рукояті/полички/вікна; стріла по руці; без overdraw.",
    "description_es": "≥135 cm; de una pieza o 2 piezas unidas en la empuñadura; curvatura continua; sin empuñadura tipo pistola/repisa/ventana; flecha sobre la mano; sin overdraw.",
    "rule_reference": "HDH-IAA",
    "rule_citation": "HDH-IAA Rules of Historical Archery (2025), §8.3.3 — Historical longbows and other stick bows"
  },
  {
    "code": "TWR",
    "name": "Traditional Bow with Window/Arrow Rest",
    "description_en": "Recurve/longbow/self bow with wooden handle; window and shelf allowed; simple arrow rest (fur/leather) allowed; ILF not permitted; dampers allowed; no overdraw.",
    "description_pt": "Recurvo/longbow/self com punho de madeira; janela e prateleira permitidas; descanso simples (pelo/couro) permitido; ILF não permitido; amortecedores permitidos; sem overdraw.",
    "description_it": "Ricurvo/longbow/self con impugnatura in legno; finestra e shelf consentite; rest semplice (pelo/cuoio) consentito; ILF non consentito; ammortizzatori ammessi; niente overdraw.",
    "description_uk": "Рекурсивний/лонгбоу/селф-лук із дерев’яним руків’ям; вікно і поличка дозволені; простий rest (хутро/шкіра) дозволений; ILF заборонено; демпфери дозволені; без overdraw.",
    "description_es": "Recurvo/longbow/self con empuñadura de madera; se permiten ventana y repisa; reposaflechas simple (piel/cuero) permitido; ILF no permitido; amortiguadores permitidos; sin overdraw.",
    "rule_reference": "HDH-IAA",
    "rule_citation": "HDH-IAA Rules of Historical Archery (2025), §8.3.4 — Traditional bow with a window or arrow rest"
  },
  {
    "code": "HCB",
    "name": "Historical Crossbow",
    "description_en": "Historical-shaped crossbow; wooden stock; ≤110 lb; historical mechanisms only (no modern triggers/sights); handheld (no stand/support). Arrow longer than rest; point protrudes.",
    "description_pt": "Besta de forma histórica; coronha em madeira; ≤110 lb; apenas mecanismos históricos (sem gatilhos/miras modernas); de mão (sem apoio/suporte). Virote mais longo que o apoio; ponta saliente.",
    "description_it": "Balestra di forma storica; calcio in legno; ≤110 lb; solo meccanismi storici (no grilletti/mirini moderni); a mano (senza appoggio/supporto). Freccia più lunga del rest; punta sporgente.",
    "description_uk": "Арбалет історичної форми; дерев’яне ложе; ≤110 lb; лише історичні механізми (без сучасних спусків/прицілів); утримується в руках (без упора/штатива). Стріла довша за упор; вістря виступає.",
    "description_es": "Ballesta de forma histórica; culata de madera; ≤110 lb; solo mecanismos históricos (sin gatillos/visores modernos); a mano (sin soporte). Saeta más larga que el apoyo; la punta sobresale.",
    "rule_reference": "HDH-IAA",
    "rule_citation": "HDH-IAA Rules of Historical Archery (2025), §8.3.5 — Historical crossbows"
  }
];

export default categoriesData;


