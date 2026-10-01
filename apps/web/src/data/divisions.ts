import type { DivisionDto } from '../services/types';

const divisionsData: DivisionDto[] = [
  { id: 'ifaa-cub', name: 'Cub', description: 'Under 13', rule_code: 'IFAA' },
  { id: 'ifaa-junior', name: 'Junior', description: '13-16', rule_code: 'IFAA' },
  { id: 'ifaa-young-adult', name: 'Young Adult', description: '17-20', rule_code: 'IFAA' },
  { id: 'ifaa-adult', name: 'Adult', description: '21-54', rule_code: 'IFAA' },
  {
    id: 'ifaa-veteran',
    name: 'Veteran',
    description: '55 and over (optional; may shoot Adult instead)',
    rule_code: 'IFAA',
  },
  {
    id: 'ifaa-senior',
    name: 'Senior',
    description: '65 and over (optional; may shoot Veteran or Adult instead)',
    rule_code: 'IFAA',
  },
  { id: 'fabp-cub', name: 'Cub', description: 'Under 13', rule_code: 'FABP' },
  { id: 'fabp-junior', name: 'Junior', description: '13-16', rule_code: 'FABP' },
  {
    id: 'fabp-young-adult',
    name: 'Young Adult',
    description: '18-20 (suspended at national events)',
    rule_code: 'FABP',
  },
  {
    id: 'fabp-adult',
    name: 'Adult',
    description: '21-54 (17 and over may shoot Adult)',
    rule_code: 'FABP',
  },
  { id: 'fabp-veteran', name: 'Veteran', description: '55-64 (optional)', rule_code: 'FABP' },
  {
    id: 'fabp-senior',
    name: 'Senior',
    description: '65 and over (optional; suspended at national events)',
    rule_code: 'FABP',
  },
  { id: 'hdh-mini', name: 'Mini', description: '10-12 (optional)', rule_code: 'HDH-IAA' },
  { id: 'hdh-cadet', name: 'Cadet', description: '13-14 (optional)', rule_code: 'HDH-IAA' },
  { id: 'hdh-junior', name: 'Junior', description: '15-20', rule_code: 'HDH-IAA' },
  {
    id: 'hdh-young-adult',
    name: 'Young Adult',
    description: '18-20 (optional split from Junior)',
    rule_code: 'HDH-IAA',
  },
  { id: 'hdh-adult', name: 'Adult', description: '21-50', rule_code: 'HDH-IAA' },
  { id: 'hdh-veteran', name: 'Veteran', description: '55 and over', rule_code: 'HDH-IAA' },
  { id: 'fpta-flechas', name: 'Flechas', description: 'Under 9', rule_code: 'FPTA' },
  { id: 'fpta-robins', name: 'Robins', description: '9-11', rule_code: 'FPTA' },
  { id: 'fpta-juvenis', name: 'Juvenis', description: '12-14', rule_code: 'FPTA' },
  { id: 'fpta-cadet', name: 'Cadet', description: '15-17', rule_code: 'FPTA' },
  { id: 'fpta-junior', name: 'Junior', description: '18-20', rule_code: 'FPTA' },
  { id: 'fpta-senior', name: 'Senior', description: '21 and over', rule_code: 'FPTA' },
  {
    id: 'fpta-veteran',
    name: 'Veteran',
    description: '50 and over (optional)',
    rule_code: 'FPTA',
  },
];

export default divisionsData;
