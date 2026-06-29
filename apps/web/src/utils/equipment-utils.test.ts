import { describe, expect, it } from 'vitest';

import {
  getEquipmentSetName,
  resolveDefaultEquipmentSetId,
  resolveEquipmentSet,
} from './equipment-utils';
import type { LocalEquipmentSet } from './local-data-storage';

function equipmentSet(overrides: Partial<LocalEquipmentSet> = {}): LocalEquipmentSet {
  return {
    id: 'eq1',
    isSynced: false,
    name: 'My Bow',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    ...overrides,
  };
}

describe('resolveEquipmentSet', () => {
  const sets = [
    equipmentSet({ id: 'eq1', name: 'Bow 1' }),
    equipmentSet({ id: 'eq2', serverId: 'server-2', name: 'Bow 2' }),
  ];

  it('returns undefined when id is undefined', () => {
    expect(resolveEquipmentSet(undefined, sets)).toBeUndefined();
  });

  it('finds by local id', () => {
    const result = resolveEquipmentSet('eq1', sets);
    expect(result?.name).toBe('Bow 1');
  });

  it('finds by serverId', () => {
    const result = resolveEquipmentSet('server-2', sets);
    expect(result?.name).toBe('Bow 2');
  });

  it('returns undefined when no match', () => {
    expect(resolveEquipmentSet('nonexistent', sets)).toBeUndefined();
  });

  it('returns undefined for empty array', () => {
    expect(resolveEquipmentSet('eq1', [])).toBeUndefined();
  });
});

describe('getEquipmentSetName', () => {
  const sets = [equipmentSet({ id: 'eq1', name: 'Bow 1' })];

  it('returns name when found', () => {
    expect(getEquipmentSetName('eq1', sets)).toBe('Bow 1');
  });

  it('returns undefined when not found', () => {
    expect(getEquipmentSetName('missing', sets)).toBeUndefined();
  });

  it('returns undefined when id is undefined', () => {
    expect(getEquipmentSetName(undefined, sets)).toBeUndefined();
  });
});

describe('resolveDefaultEquipmentSetId', () => {
  it('returns null when nothing stored', () => {
    localStorage.clear();
    expect(resolveDefaultEquipmentSetId([])).toBeNull();
  });

  it('returns null when stored id does not match any set', () => {
    localStorage.setItem('sokil_default_equipment_set_id', 'nonexistent');
    expect(resolveDefaultEquipmentSetId([])).toBeNull();
  });

  it('returns stored id when it matches a set', () => {
    localStorage.setItem('sokil_default_equipment_set_id', 'eq1');
    const sets = [equipmentSet({ id: 'eq1' })];
    expect(resolveDefaultEquipmentSetId(sets)).toBe('eq1');
  });

  it('returns stored id when it matches by serverId', () => {
    localStorage.setItem('sokil_default_equipment_set_id', 'server-1');
    const sets = [equipmentSet({ id: 'eq1', serverId: 'server-1' })];
    expect(resolveDefaultEquipmentSetId(sets)).toBe('eq1');
  });
});
