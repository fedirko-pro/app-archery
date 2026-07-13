import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { LocalEquipmentSet, LocalTrainingSession } from './local-data-storage';
import {
  getEquipmentSets,
  getTrainingSessions,
  saveEquipmentSet,
  saveTrainingSession,
  updateEquipmentSet,
  writeEquipmentSets,
  writeTrainingSessions,
} from './local-data-storage';
import {
  addTombstone,
  clearTombstone,
  getTombstones,
  hasTombstone,
  mergeServerEquipmentSets,
  mergeServerTrainingSessions,
  pushEquipmentSetToServer,
  pushSessionToServer,
  sessionToServerDto,
} from './local-data-sync';

function equipmentSet(overrides: Partial<LocalEquipmentSet> = {}): LocalEquipmentSet {
  return {
    id: 'local_eq1',
    isSynced: false,
    name: 'My Bow',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function trainingSession(overrides: Partial<LocalTrainingSession> = {}): LocalTrainingSession {
  return {
    id: 'local_sess1',
    isSynced: false,
    date: '2026-07-13',
    createdAt: '2026-07-13T12:00:00.000Z',
    updatedAt: '2026-07-13T12:00:00.000Z',
    ...overrides,
  };
}

describe('pushEquipmentSetToServer', () => {
  const createEquipmentSet = vi.fn(async () => ({ id: 'server-new' }));
  const updateEquipmentSetApi = vi.fn(async () => ({ id: 'server-existing' }));
  const api = {
    createEquipmentSet,
    updateEquipmentSet: updateEquipmentSetApi,
    deleteEquipmentSet: vi.fn(async () => undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('POSTs when set has no serverId', async () => {
    const set = equipmentSet({ name: 'Field Bow' });
    const result = await pushEquipmentSetToServer(set, api);
    expect(createEquipmentSet).toHaveBeenCalledOnce();
    expect(updateEquipmentSetApi).not.toHaveBeenCalled();
    expect(result.serverId).toBe('server-new');
  });

  it('PATCHes when set already has serverId', async () => {
    const set = equipmentSet({ serverId: 'server-existing', name: 'Updated Bow' });
    const result = await pushEquipmentSetToServer(set, api);
    expect(updateEquipmentSetApi).toHaveBeenCalledWith(
      'server-existing',
      expect.objectContaining({
        name: 'Updated Bow',
      }),
    );
    expect(createEquipmentSet).not.toHaveBeenCalled();
    expect(result.serverId).toBe('server-existing');
  });
});

describe('sessionToServerDto equipmentSetId mapping', () => {
  it('maps local equipmentSetId to server id', () => {
    const sets = [
      equipmentSet({ id: 'local_eq1', serverId: 'server-eq-1', name: 'Competition Bow' }),
    ];
    const session = trainingSession({ equipmentSetId: 'local_eq1' });
    expect(sessionToServerDto(session, sets).equipmentSetId).toBe('server-eq-1');
  });

  it('omits equipmentSetId when local set has no server mapping', () => {
    const sets = [equipmentSet({ id: 'local_eq1' })];
    const session = trainingSession({ equipmentSetId: 'local_eq1' });
    expect(sessionToServerDto(session, sets).equipmentSetId).toBeUndefined();
  });
});

describe('pushSessionToServer', () => {
  const createTrainingSession = vi.fn(async () => ({ id: 'server-session-new' }));
  const updateTrainingSession = vi.fn(async () => ({ id: 'server-session-existing' }));
  const api = {
    createTrainingSession,
    updateTrainingSession,
    deleteTrainingSession: vi.fn(async () => undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('POSTs when session has no serverId', async () => {
    const session = trainingSession({ shotsCount: 12 });
    const result = await pushSessionToServer(session, [], api);
    expect(createTrainingSession).toHaveBeenCalledOnce();
    expect(updateTrainingSession).not.toHaveBeenCalled();
    expect(result.serverId).toBe('server-session-new');
  });

  it('PATCHes when session already has serverId', async () => {
    const session = trainingSession({ serverId: 'server-session-existing', shotsCount: 24 });
    const result = await pushSessionToServer(session, [], api);
    expect(updateTrainingSession).toHaveBeenCalledWith(
      'server-session-existing',
      expect.objectContaining({ shotsCount: 24 }),
    );
    expect(createTrainingSession).not.toHaveBeenCalled();
    expect(result.serverId).toBe('server-session-existing');
  });
});

describe('mergeServerEquipmentSets LWW', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('overwrites local row when server updatedAt is newer', () => {
    writeEquipmentSets([
      equipmentSet({
        id: 'local_1',
        serverId: 'server_1',
        name: 'Old Name',
        updatedAt: '2026-01-01T00:00:00.000Z',
        isSynced: true,
      }),
    ]);

    mergeServerEquipmentSets([
      {
        id: 'server_1',
        name: 'New Name',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-02-01T00:00:00.000Z',
      },
    ]);

    const merged = getEquipmentSets()[0];
    expect(merged.name).toBe('New Name');
    expect(merged.id).toBe('local_1');
  });

  it('keeps newer unsynced local row when server is older', () => {
    writeEquipmentSets([
      equipmentSet({
        id: 'local_1',
        serverId: 'server_1',
        name: 'Local Edit',
        updatedAt: '2026-03-01T00:00:00.000Z',
        isSynced: false,
      }),
    ]);

    mergeServerEquipmentSets([
      {
        id: 'server_1',
        name: 'Server Name',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-02-01T00:00:00.000Z',
      },
    ]);

    expect(getEquipmentSets()[0].name).toBe('Local Edit');
  });

  it('inserts new server rows', () => {
    mergeServerEquipmentSets([
      {
        id: 'server_new',
        name: 'Imported Bow',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ]);

    const sets = getEquipmentSets();
    expect(sets).toHaveLength(1);
    expect(sets[0].serverId).toBe('server_new');
    expect(sets[0].name).toBe('Imported Bow');
  });
});

describe('tombstones', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('records and clears tombstones', () => {
    addTombstone('equipment', 'server_deleted');
    expect(hasTombstone('equipment', 'server_deleted')).toBe(true);
    expect(getTombstones()).toHaveLength(1);
    clearTombstone('equipment', 'server_deleted');
    expect(hasTombstone('equipment', 'server_deleted')).toBe(false);
  });

  it('skips re-inserting tombstoned equipment during merge', () => {
    addTombstone('equipment', 'server_deleted');
    mergeServerEquipmentSets([
      {
        id: 'server_deleted',
        name: 'Deleted Bow',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ]);
    expect(getEquipmentSets()).toHaveLength(0);
  });

  it('skips re-inserting tombstoned training sessions during merge', () => {
    addTombstone('training', 'server_deleted');
    mergeServerTrainingSessions([
      {
        id: 'server_deleted',
        date: '2026-07-13',
        createdAt: '2026-07-13T12:00:00.000Z',
        updatedAt: '2026-07-13T12:00:00.000Z',
      },
    ]);
    expect(getTrainingSessions()).toHaveLength(0);
  });
});

describe('mergeServerTrainingSessions LWW', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('overwrites local session when server updatedAt is newer', () => {
    writeTrainingSessions([
      trainingSession({
        id: 'local_1',
        serverId: 'server_1',
        shotsCount: 10,
        updatedAt: '2026-01-01T00:00:00.000Z',
        isSynced: true,
      }),
    ]);

    mergeServerTrainingSessions([
      {
        id: 'server_1',
        date: '2026-07-13',
        shotsCount: 20,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-02-01T00:00:00.000Z',
      },
    ]);

    expect(getTrainingSessions()[0].shotsCount).toBe(20);
  });
});

describe('local equipment round-trip', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('creates local equipment via saveEquipmentSet for sync tests', () => {
    const created = saveEquipmentSet({ name: 'Test Bow' });
    updateEquipmentSet(created.id, { serverId: 'server-1', isSynced: false });
    const stored = getEquipmentSets().find((set) => set.id === created.id);
    expect(stored?.serverId).toBe('server-1');
    expect(stored?.isSynced).toBe(false);
  });
});

describe('local training round-trip', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('creates local session via saveTrainingSession for sync tests', () => {
    const created = saveTrainingSession({ date: '2026-07-13', status: 'started', shotsCount: 3 });
    expect(getTrainingSessions().find((session) => session.id === created.id)?.shotsCount).toBe(3);
  });
});
