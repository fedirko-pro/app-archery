/**
 * Local-first storage for equipment sets and training sessions.
 * Data is stored in localStorage and optionally synced to the server.
 */

const STORAGE_KEYS = {
  EQUIPMENT_SETS: 'uarchery_equipment_sets',
  TRAININGS: 'uarchery_trainings',
} as const;

export interface CustomField {
  key: string;
  value: string;
}

export interface LocalEquipmentSet {
  id: string;
  serverId?: string;
  isSynced: boolean;
  name: string;
  bowType?: string;
  manufacturer?: string;
  model?: string;
  drawWeight?: string;
  arrowLength?: string;
  arrowSpine?: string;
  arrowWeight?: string;
  arrowMaterial?: string;
  customFields?: CustomField[];
  createdAt: string;
  updatedAt: string;
}

export interface LocalTrainingSession {
  id: string;
  serverId?: string;
  isSynced: boolean;
  date: string;
  shotsCount?: number;
  distance?: string;
  targetType?: string;
  equipmentSetId?: string;
  customFields?: CustomField[];
  createdAt: string;
  updatedAt: string;
}

function generateId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function readStorage<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function writeStorage<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // quota exceeded or disabled localStorage
  }
}

// Equipment Sets

export function getEquipmentSets(): LocalEquipmentSet[] {
  return readStorage<LocalEquipmentSet>(STORAGE_KEYS.EQUIPMENT_SETS);
}

export function saveEquipmentSet(
  data: Omit<LocalEquipmentSet, 'id' | 'isSynced' | 'createdAt' | 'updatedAt'>,
): LocalEquipmentSet {
  const sets = getEquipmentSets();
  const now = new Date().toISOString();
  const newSet: LocalEquipmentSet = {
    ...data,
    id: generateId(),
    isSynced: false,
    createdAt: now,
    updatedAt: now,
  };
  writeStorage(STORAGE_KEYS.EQUIPMENT_SETS, [...sets, newSet]);
  return newSet;
}

export function updateEquipmentSet(
  id: string,
  data: Partial<Omit<LocalEquipmentSet, 'id' | 'createdAt'>>,
): LocalEquipmentSet | null {
  const sets = getEquipmentSets();
  const index = sets.findIndex((s) => s.id === id);
  if (index === -1) return null;

  const updated: LocalEquipmentSet = {
    ...sets[index],
    ...data,
    updatedAt: new Date().toISOString(),
    isSynced: data.isSynced !== undefined ? data.isSynced : false,
  };
  sets[index] = updated;
  writeStorage(STORAGE_KEYS.EQUIPMENT_SETS, sets);
  return updated;
}

export function deleteEquipmentSet(id: string): void {
  const sets = getEquipmentSets().filter((s) => s.id !== id);
  writeStorage(STORAGE_KEYS.EQUIPMENT_SETS, sets);
}

export function markEquipmentSetSynced(id: string, serverId: string): void {
  updateEquipmentSet(id, { serverId, isSynced: true });
}

// Training Sessions

export function getTrainingSessions(): LocalTrainingSession[] {
  return readStorage<LocalTrainingSession>(STORAGE_KEYS.TRAININGS);
}

export function saveTrainingSession(
  data: Omit<LocalTrainingSession, 'id' | 'isSynced' | 'createdAt' | 'updatedAt'>,
): LocalTrainingSession {
  const sessions = getTrainingSessions();
  const now = new Date().toISOString();
  const newSession: LocalTrainingSession = {
    ...data,
    id: generateId(),
    isSynced: false,
    createdAt: now,
    updatedAt: now,
  };
  writeStorage(STORAGE_KEYS.TRAININGS, [...sessions, newSession]);
  return newSession;
}

export function updateTrainingSession(
  id: string,
  data: Partial<Omit<LocalTrainingSession, 'id' | 'createdAt'>>,
): LocalTrainingSession | null {
  const sessions = getTrainingSessions();
  const index = sessions.findIndex((s) => s.id === id);
  if (index === -1) return null;

  const updated: LocalTrainingSession = {
    ...sessions[index],
    ...data,
    updatedAt: new Date().toISOString(),
    isSynced: data.isSynced !== undefined ? data.isSynced : false,
  };
  sessions[index] = updated;
  writeStorage(STORAGE_KEYS.TRAININGS, sessions);
  return updated;
}

export function deleteTrainingSession(id: string): void {
  const sessions = getTrainingSessions().filter((s) => s.id !== id);
  writeStorage(STORAGE_KEYS.TRAININGS, sessions);
}

export function markTrainingSessionSynced(id: string, serverId: string): void {
  updateTrainingSession(id, { serverId, isSynced: true });
}

export function mergeServerEquipmentSets(
  serverSets: Array<{
    id: string;
    name: string;
    bowType?: string;
    manufacturer?: string;
    model?: string;
    drawWeight?: string;
    arrowLength?: string;
    arrowSpine?: string;
    arrowWeight?: string;
    arrowMaterial?: string;
    customFields?: CustomField[];
    createdAt: string;
    updatedAt: string;
  }>,
): void {
  const local = getEquipmentSets();
  const serverIds = new Set(serverSets.map((s) => s.id));

  // Remove local items that have a serverId not in server list (deleted server-side)
  const filtered = local.filter((l) => !l.serverId || serverIds.has(l.serverId));

  // Upsert server items
  for (const serverSet of serverSets) {
    const existing = filtered.find((l) => l.serverId === serverSet.id);
    if (!existing) {
      filtered.push({
        id: `server_${serverSet.id}`,
        serverId: serverSet.id,
        isSynced: true,
        name: serverSet.name,
        bowType: serverSet.bowType,
        manufacturer: serverSet.manufacturer,
        model: serverSet.model,
        drawWeight: serverSet.drawWeight,
        arrowLength: serverSet.arrowLength,
        arrowSpine: serverSet.arrowSpine,
        arrowWeight: serverSet.arrowWeight,
        arrowMaterial: serverSet.arrowMaterial,
        customFields: serverSet.customFields,
        createdAt: serverSet.createdAt,
        updatedAt: serverSet.updatedAt,
      });
    }
  }

  writeStorage(STORAGE_KEYS.EQUIPMENT_SETS, filtered);
}

export function mergeServerTrainingSessions(
  serverSessions: Array<{
    id: string;
    date: string;
    shotsCount?: number;
    distance?: string;
    targetType?: string;
    equipmentSetId?: string;
    customFields?: CustomField[];
    createdAt: string;
    updatedAt: string;
  }>,
): void {
  const local = getTrainingSessions();
  const serverIds = new Set(serverSessions.map((s) => s.id));

  const filtered = local.filter((l) => !l.serverId || serverIds.has(l.serverId));

  for (const serverSession of serverSessions) {
    const existing = filtered.find((l) => l.serverId === serverSession.id);
    if (!existing) {
      filtered.push({
        id: `server_${serverSession.id}`,
        serverId: serverSession.id,
        isSynced: true,
        date: serverSession.date,
        shotsCount: serverSession.shotsCount,
        distance: serverSession.distance,
        targetType: serverSession.targetType,
        equipmentSetId: serverSession.equipmentSetId,
        customFields: serverSession.customFields,
        createdAt: serverSession.createdAt,
        updatedAt: serverSession.updatedAt,
      });
    }
  }

  writeStorage(STORAGE_KEYS.TRAININGS, filtered);
}
