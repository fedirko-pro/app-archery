import type { CategoryDto } from '../services/types';

/**
 * FE-only seed data for bow categories, used until the backend is ready.
 * Extend freely during development; URLs for rule citations will point to /rules#<citation>.
 */
const categoriesData: CategoryDto[] = [
    {
      "code": "FU",
      "name": "Freestyle Unlimited",
      "description": "Any bow with sight and mechanical release permitted; full stabilization and modern accessories allowed.",
      "rule_reference": "IFAA",
      "rule_citation": "IFAA Book of Rules (2021), Article IV.E.2 — Freestyle Unlimited"
    },
    {
      "code": "FSC",
      "name": "Freestyle Limited Compound",
      "description": "Compound with sight; mechanical release NOT allowed.",
      "rule_reference": "IFAA",
      "rule_citation": "IFAA Book of Rules (2021), Article IV.E.3 — Freestyle Limited"
    },
    {
      "code": "FSR",
      "name": "Freestyle Limited Recurve",
      "description": "Recurve with sight; mechanical release NOT allowed.",
      "rule_reference": "IFAA",
      "rule_citation": "IFAA Book of Rules (2021), Article IV.E.3 — Freestyle Limited"
    },
    {
      "code": "BU",
      "name": "Bowhunter Unlimited",
      "description": "4–5 fixed-pin sight, release aid allowed; peep OR kisser (not both); limited stabilizer; no scopes.",
      "rule_reference": "IFAA",
      "rule_citation": "IFAA Book of Rules (2021), Article IV.E.5 — Bowhunter Unlimited"
    },
    {
      "code": "BL",
      "name": "Bowhunter Limited",
      "description": "As Bowhunter Unlimited but shot with fingers only; no mechanical release.",
      "rule_reference": "IFAA",
      "rule_citation": "IFAA Book of Rules (2021), Article IV.E.6 — Bowhunter Limited"
    },
    {
      "code": "BBR",
      "name": "Barebow Recurve",
      "description": "Recurve without sights; single nocking point; optional non-adjustable draw check/level below arrow; stabilizers allowed.",
      "rule_reference": "IFAA",
      "rule_citation": "IFAA Book of Rules (2021), Article IV.E.1 — Barebow (Recurve)"
    },
    {
      "code": "BBC",
      "name": "Barebow Compound",
      "description": "Compound without sights; single nocking point; draw stops allowed; stabilizers allowed.",
      "rule_reference": "IFAA",
      "rule_citation": "IFAA Book of Rules (2021), Article IV.E.1 — Barebow (Compound)"
    },
    {
      "code": "BHR",
      "name": "Bowhunter Recurve",
      "description": "Recurve shot with fingers; no sights/peep/kisser/level; one straight stabilizer (length-limited).",
      "rule_reference": "IFAA",
      "rule_citation": "IFAA Book of Rules (2021), Article IV.E.4 — Bowhunter (Recurve & Compound)"
    },
    {
      "code": "BHC",
      "name": "Bowhunter Compound",
      "description": "Compound shot with fingers; no sights/peep/level; one straight stabilizer (length-limited); draw stops allowed.",
      "rule_reference": "IFAA",
      "rule_citation": "IFAA Book of Rules (2021), Article IV.E.4 — Bowhunter (Recurve & Compound)"
    },
    {
      "code": "TR",
      "name": "Traditional Recurve",
      "description": "Wood riser (may be laminated); wood-core limbs with glass/carbon laminates allowed; shot off shelf/hand; no rest/sight/stabilizers.",
      "rule_reference": "IFAA",
      "rule_citation": "IFAA Book of Rules (2021), Article IV.E.9 — Traditional Recurve"
    },
    {
      "code": "LB",
      "name": "Longbow",
      "description": "One-piece or 2-piece joined at handle; continuous limb curve; shelf/window permitted (not past center); no sights/stabilizers; wood arrows.",
      "rule_reference": "IFAA",
      "rule_citation": "IFAA Book of Rules (2021), Article IV.E.7 — Longbow"
    },
    {
      "code": "HB",
      "name": "Historical Bow (IFAA)",
      "description": "Pre-1900 design; self-wood or composite; only historically used materials (no carbon/fiberglass/epoxy); polyester string; wood arrows with feathers.",
      "rule_reference": "IFAA",
      "rule_citation": "IFAA Book of Rules (2021), Article IV.E.8 — Historical Bow"
    },
  
    {
      "code": "HBR",
      "name": "Historical Bow Recurve",
      "description": "Recurve–reflex (horse bow/nomad) made primarily from natural materials; may include laminations of modern fibers (e.g., fiberglass/carbon/biocomposites). No shooting window. Allowed releases: Mediterranean, 3-under (with finger contact on the arrow), or thumb ring (arrow runs on the medial side). No face-walking or string-walking. Arrows of wood/bamboo with natural feathers; nocks in horn, bone, metal, wood, or self-nocks; arrows similar in length (±25 mm), diameter, fletching and points; no sighting marks/paint on arrows.",
      "rule_reference": "FABP",
      "rule_citation": "FABP QC2025 — Rota dos Castelos: 2.a) Histórico (HBR)"
    },
    {
      "code": "MBR",
      "name": "Modern Bow Recurve",
      "description": "Recurve–reflex built entirely from modern materials (e.g., fiberglass, carbon, synthetics), one- or two-piece (take-down). Same shooting rules as HBR: Mediterranean, 3-under (with finger contact on the arrow), or thumb ring; no face-walking or string-walking. Arrows of wood/bamboo with natural feathers; traditional nocks allowed; arrows similar in length (±25 mm), diameter, fletching and points; no sighting marks/paint on arrows.",
      "rule_reference": "FABP",
      "rule_citation": "FABP QC2025 — Rota dos Castelos: 2.b) Moderno (MBR)"
    },
    {
      "code": "SC-St",
      "name": "Sport Crossbow Standard",
      "description": "FABP sport crossbow — standard configuration; unisex category.",
      "rule_reference": "FABP",
      "rule_citation": "FABP QC2025, Art. 8.2 — Categorias Crossbow Unissexo (SC-St, SC-Fs, TC, MC)"
    },
    {
      "code": "SC-Fs",
      "name": "Sport Crossbow Freestyle",
      "description": "FABP sport crossbow — freestyle configuration; unisex category.",
      "rule_reference": "FABP",
      "rule_citation": "FABP QC2025, Art. 8.2 — Categorias Crossbow Unissexo (SC-St, SC-Fs, TC, MC)"
    },
    {
      "code": "TC",
      "name": "Target Crossbow",
      "description": "FABP target crossbow discipline; unisex category.",
      "rule_reference": "FABP",
      "rule_citation": "FABP QC2025, Art. 8.2 — Categorias Crossbow Unissexo (SC-St, SC-Fs, TC, MC)"
    },
    {
      "code": "MC",
      "name": "Medieval Crossbow",
      "description": "FABP medieval (historical-style) crossbow discipline; unisex category.",
      "rule_reference": "FABP",
      "rule_citation": "FABP QC2025, Art. 8.2 — Categorias Crossbow Unissexo (SC-St, SC-Fs, TC, MC)"
    },
  
    {
      "code": "HBM",
      "name": "Historical Bow — Modern Materials",
      "description": "Historical bow form (e.g., Hungarian, Turkish, English, Yumi) using modern materials (e.g., fiberglass/modern adhesive); no shelf/window; arrow off hand; no overdraw.",
      "rule_reference": "HDH-IAA",
      "rule_citation": "HDH-IAA Rules of Historical Archery (2025), §8.3.1 — Historical bow made of modern materials"
    },
    {
      "code": "HBN",
      "name": "Historical Bow — Natural Materials",
      "description": "Historical bow form from natural materials only (wood, horn, bone, tendon, bamboo); carved/natural nocks; no shelf/window; arrow off hand; authenticity certification.",
      "rule_reference": "HDH-IAA",
      "rule_citation": "HDH-IAA Rules of Historical Archery (2025), §8.3.2 — Historical bow made of natural materials"
    },
    {
      "code": "HLB",
      "name": "Historical Longbow / Stick Bow",
      "description": "≥135 cm; one-piece or 2-part at handle; continuous curve; no pistol grip/shelf/window; arrow off hand; no overdraw.",
      "rule_reference": "HDH-IAA",
      "rule_citation": "HDH-IAA Rules of Historical Archery (2025), §8.3.3 — Historical longbows and other stick bows"
    },
    {
      "code": "TWR",
      "name": "Traditional Bow with Window/Arrow Rest",
      "description": "Recurve/longbow/self bow with wooden handle; window and shelf allowed; simple arrow support (fur/leather) allowed; ILF not permitted; dampers allowed; no overdraw.",
      "rule_reference": "HDH-IAA",
      "rule_citation": "HDH-IAA Rules of Historical Archery (2025), §8.3.4 — Traditional bow with a window or arrow rest"
    },
    {
      "code": "HCB",
      "name": "Historical Crossbow",
      "description": "Historical shape; wooden stock; ≤110 lb; historical mechanisms only (no modern triggers/sights); handheld (no stand/support); arrow longer than rest, point protrudes.",
      "rule_reference": "HDH-IAA",
      "rule_citation": "HDH-IAA Rules of Historical Archery (2025), §8.3.5 — Historical crossbows"
    }
  ];

export default categoriesData;


