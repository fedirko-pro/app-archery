/**
 * Local-first storage for equipment sets and training sessions.
 * Data is stored in localStorage and optionally synced to the server.
 */

const STORAGE_KEYS = {
  EQUIPMENT_SETS: 'sokil_equipment_sets',
  TRAININGS: 'sokil_trainings',
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
  drawWeight?: number;
  arrowLength?: string;
  arrowSpine?: string;
  arrowWeight?: string;
  arrowMaterial?: string;
  customFields?: CustomField[];
  createdAt: string;
  updatedAt: string;
}

export type TrainingSessionStatus = 'started' | 'finished';
export type TrainingMood = 'bad' | 'normal' | 'good' | 'amazing';

export interface LocalTrainingSession {
  id: string;
  serverId?: string;
  isSynced: boolean;
  date: string;
  status?: TrainingSessionStatus;
  shotsCount?: number;
  arrowsPerSet?: number;
  distance?: string;
  targetType?: string;
  equipmentSetId?: string;
  scoreTotal?: number;
  notes?: string;
  mood?: TrainingMood;
  customFields?: CustomField[];
  createdAt: string;
  updatedAt: string;
}

export type StorageWriteFailureReason = 'quota' | 'disabled' | 'unknown';

export class StorageWriteError extends Error {
  readonly reason: StorageWriteFailureReason;

  constructor(reason: StorageWriteFailureReason) {
    super(`Storage write failed: ${reason}`);
    this.name = 'StorageWriteError';
    this.reason = reason;
  }
}

function generateId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Draw weight is stored as a number in pounds. Older records may hold a string
 * such as "40 lbs"; this best-effort extracts the leading number from those.
 */
export function coerceDrawWeightLbs(raw: unknown): number | undefined {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : undefined;
  if (typeof raw === 'string') {
    const match = raw.replace(',', '.').match(/-?\d+(\.\d+)?/);
    if (match) {
      const value = Number.parseFloat(match[0]);
      return Number.isFinite(value) ? value : undefined;
    }
  }
  return undefined;
}

function classifyStorageError(error: unknown): StorageWriteFailureReason {
  if (error instanceof DOMException) {
    if (error.name === 'QuotaExceededError' || error.code === 22) return 'quota';
    if (error.name === 'SecurityError') return 'disabled';
  }
  return 'unknown';
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
  } catch (error) {
    throw new StorageWriteError(classifyStorageError(error));
  }
}

export function writeEquipmentSets(sets: LocalEquipmentSet[]): void {
  writeStorage(STORAGE_KEYS.EQUIPMENT_SETS, sets);
}

export function writeTrainingSessions(sessions: LocalTrainingSession[]): void {
  writeStorage(STORAGE_KEYS.TRAININGS, sessions);
}

// Equipment Sets

export function getEquipmentSets(): LocalEquipmentSet[] {
  return readStorage<LocalEquipmentSet>(STORAGE_KEYS.EQUIPMENT_SETS).map((set) => ({
    ...set,
    drawWeight: coerceDrawWeightLbs(set.drawWeight),
  }));
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

export function incrementTrainingSessionShots(
  id: string,
  delta: number,
  options?: { arrowsPerSet?: number },
): LocalTrainingSession | null {
  const sessions = getTrainingSessions();
  const index = sessions.findIndex((s) => s.id === id);
  if (index === -1) return null;

  const current = sessions[index];
  const updated: LocalTrainingSession = {
    ...current,
    shotsCount: Math.max(0, (current.shotsCount ?? 0) + delta),
    ...(options?.arrowsPerSet !== undefined ? { arrowsPerSet: options.arrowsPerSet } : {}),
    updatedAt: new Date().toISOString(),
    isSynced: false,
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
