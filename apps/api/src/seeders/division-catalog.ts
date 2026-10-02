export interface DivisionSeed {
  name: string;
  description: string;
}

function menWomen(label: string, age: string): DivisionSeed[] {
  return [
    { name: `${label} Male`, description: `Men ${age}` },
    { name: `${label} Female`, description: `Women ${age}` },
  ];
}

function boysGirls(label: string, age: string): DivisionSeed[] {
  return [
    { name: `${label} Male`, description: `Boys ${age}` },
    { name: `${label} Female`, description: `Girls ${age}` },
  ];
}

const IFAA_DIVISIONS: DivisionSeed[] = [
  ...boysGirls('Cub', 'under 13'),
  ...boysGirls('Junior', '13-16'),
  ...menWomen('Young Adult', '17-20'),
  ...menWomen('Adult', '21-54'),
  ...menWomen('Veteran', '55 and over (optional; may shoot Adult instead)'),
  ...menWomen('Senior', '65 and over (optional; may shoot Veteran or Adult instead)'),
];

/** Art. 7.1.2 — FABP IFAA championships (Indoor, Field, Bowhunter). */
const FABP_IFAA_DIVISIONS: DivisionSeed[] = [
  ...boysGirls('Cub', 'under 13'),
  ...boysGirls('Junior', '13-16 inclusive'),
  ...menWomen('Young Adult', '17-20 (suspended at national events)'),
  ...menWomen('Adult', '21-54 (17 and over may shoot Adult)'),
  ...menWomen('Veteran', '55-64 (optional)'),
  ...menWomen('Senior', '65 and over (optional; suspended at national events)'),
];

/** Art. 7.1.1 / Art. 27.10 — Campeonato dos Castelos. */
const FABP_CASTELOS_DIVISIONS: DivisionSeed[] = [
  {
    name: 'Mancebos',
    description: 'Under 13 inclusive (unisex; Campeonato dos Castelos)',
  },
  {
    name: 'Infantes',
    description: 'Boys 14-16 inclusive (Campeonato dos Castelos)',
  },
  {
    name: 'Donzelas',
    description: 'Girls 14-16 inclusive (Campeonato dos Castelos)',
  },
  {
    name: 'Cavaleiros',
    description: 'Men 17 and over (Campeonato dos Castelos)',
  },
  {
    name: 'Damas',
    description: 'Women 17 and over (Campeonato dos Castelos)',
  },
];

const FABP_DIVISIONS: DivisionSeed[] = [...FABP_IFAA_DIVISIONS, ...FABP_CASTELOS_DIVISIONS];

const HDH_DIVISIONS: DivisionSeed[] = [
  ...boysGirls('Mini', '10-12 (optional)'),
  ...boysGirls('Cadet', '13-14 (optional)'),
  ...menWomen('Junior', '15-20'),
  ...menWomen('Young Adult', '18-20 (optional split from Junior)'),
  ...menWomen('Adult', '21-50'),
  ...menWomen('Veteran', '55 and over'),
];

const FPTA_DIVISIONS: DivisionSeed[] = [
  ...boysGirls('Flechas', 'under 9'),
  ...boysGirls('Robins', '9-11'),
  ...boysGirls('Juvenis', '12-14'),
  ...menWomen('Cadet', '15-17'),
  ...menWomen('Junior', '18-20'),
  ...menWomen('Senior', '21 and over'),
  ...menWomen('Veteran', '50 and over (optional)'),
];

export const DIVISIONS_BY_RULE: Record<string, DivisionSeed[]> = {
  IFAA: IFAA_DIVISIONS,
  'IFAA-HB': IFAA_DIVISIONS,
  FABP: FABP_DIVISIONS,
  'HDH-IAA': HDH_DIVISIONS,
  FPTA: FPTA_DIVISIONS,
};
