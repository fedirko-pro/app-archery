import type { DivisionDto } from '../services/types';

/**
 * FE-only seed data for divisions, used until the backend is ready.
 * Divisions are age/experience groups linked to specific rules.
 * Common divisions: Cub, Junior, Adult, Veteran
 */
const divisionsData: DivisionDto[] = [
  {
    id: '1',
    name: 'Cub',
    description: 'Young archers (typically under 12 years)',
    rule_code: 'IFAA',
  },
  {
    id: '2',
    name: 'Junior',
    description: 'Junior archers (typically 12-17 years)',
    rule_code: 'IFAA',
  },
  {
    id: '3',
    name: 'Adult',
    description: 'Adult archers (typically 18-49 years)',
    rule_code: 'IFAA',
  },
  {
    id: '4',
    name: 'Veteran',
    description: 'Veteran archers (typically 50+ years)',
    rule_code: 'IFAA',
  },
  {
    id: '5',
    name: 'Cub',
    description: 'Young archers as per FABP rules',
    rule_code: 'FABP',
  },
  {
    id: '6',
    name: 'Junior',
    description: 'Junior archers as per FABP rules',
    rule_code: 'FABP',
  },
  {
    id: '7',
    name: 'Adult',
    description: 'Adult archers as per FABP rules',
    rule_code: 'FABP',
  },
  {
    id: '8',
    name: 'Veteran',
    description: 'Veteran archers as per FABP rules',
    rule_code: 'FABP',
  },
];

export default divisionsData;
