import type { CreateEquipmentSetDto, CreateTrainingSessionDto } from '../services/types';
import { resolveEquipmentSet } from './equipment-utils';
import type {
  CustomField,
  LocalEquipmentSet,
  LocalTrainingSession,
  TrainingMood,
  TrainingSessionStatus,
} from './local-data-storage';
import {
  coerceDrawWeightLbs,
  getEquipmentSets,
  getTrainingSessions,
  writeEquipmentSets,
  writeTrainingSessions,
} from './local-data-storage';
import { sessionToDto } from './training-session-utils';

const TOMBSTONE_KEY = 'sokil_deleted_server_ids';

export type TombstoneType = 'equipment' | 'training';

export interface Tombstone {
  type: TombstoneType;
  serverId: string;
  deletedAt: string;
}

export interface EquipmentSetApi {
  createEquipmentSet(dto: CreateEquipmentSetDto): Promise<{ id: string }>;
  updateEquipmentSet(id: string, dto: Partial<CreateEquipmentSetDto>): Promise<{ id: string }>;
  deleteEquipmentSet(id: string): Promise<void>;
}

export interface TrainingSessionApi {
  createTrainingSession(dto: CreateTrainingSessionDto): Promise<{ id: string }>;
  updateTrainingSession(
    id: string,
    dto: Partial<CreateTrainingSessionDto>,
  ): Promise<{ id: string }>;
  deleteTrainingSession(id: string): Promise<void>;
}

export type LocalDataApi = EquipmentSetApi & TrainingSessionApi;

function readTombstones(): Tombstone[] {
  try {
    const raw = localStorage.getItem(TOMBSTONE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Tombstone[];
  } catch {
    return [];
  }
}

function writeTombstones(tombstones: Tombstone[]): void {
  localStorage.setItem(TOMBSTONE_KEY, JSON.stringify(tombstones));
}

export function getTombstones(): Tombstone[] {
  return readTombstones();
}

export function addTombstone(type: TombstoneType, serverId: string): void {
  const tombstones = readTombstones();
  if (tombstones.some((t) => t.type === type && t.serverId === serverId)) return;
  tombstones.push({ type, serverId, deletedAt: new Date().toISOString() });
  writeTombstones(tombstones);
}

export function clearTombstone(type: TombstoneType, serverId: string): void {
  writeTombstones(readTombstones().filter((t) => !(t.type === type && t.serverId === serverId)));
}

export function hasTombstone(type: TombstoneType, serverId: string): boolean {
  return readTombstones().some((t) => t.type === type && t.serverId === serverId);
}

export function equipmentSetToDto(set: LocalEquipmentSet): CreateEquipmentSetDto {
  return {
    name: set.name,
    bowType: set.bowType,
    manufacturer: set.manufacturer,
    model: set.model,
    drawWeight: set.drawWeight,
    arrowLength: set.arrowLength,
    arrowSpine: set.arrowSpine,
    arrowWeight: set.arrowWeight,
    arrowMaterial: set.arrowMaterial,
    customFields: set.customFields,
  };
}

export function sessionToServerDto(
  session: LocalTrainingSession,
  equipmentSets: LocalEquipmentSet[],
): CreateTrainingSessionDto {
  const dto = sessionToDto(session);
  if (dto.equipmentSetId) {
    const resolved = resolveEquipmentSet(dto.equipmentSetId, equipmentSets);
    dto.equipmentSetId = resolved?.serverId ?? undefined;
  }
  return dto;
}

export async function pushEquipmentSetToServer(
  set: LocalEquipmentSet,
  api: EquipmentSetApi,
): Promise<{ serverId: string }> {
  const dto = equipmentSetToDto(set);
  if (set.serverId) {
    await api.updateEquipmentSet(set.serverId, dto);
    return { serverId: set.serverId };
  }
  const created = await api.createEquipmentSet(dto);
  return { serverId: created.id };
}

export async function pushSessionToServer(
  session: LocalTrainingSession,
  equipmentSets: LocalEquipmentSet[],
  api: TrainingSessionApi,
): Promise<{ serverId: string }> {
  const dto = sessionToServerDto(session, equipmentSets);
  if (session.serverId) {
    await api.updateTrainingSession(session.serverId, dto);
    return { serverId: session.serverId };
  }
  const created = await api.createTrainingSession(dto);
  return { serverId: created.id };
}

export async function processTombstones(api: LocalDataApi): Promise<void> {
  for (const tombstone of getTombstones()) {
    try {
      if (tombstone.type === 'equipment') {
        await api.deleteEquipmentSet(tombstone.serverId);
      } else {
        await api.deleteTrainingSession(tombstone.serverId);
      }
      clearTombstone(tombstone.type, tombstone.serverId);
    } catch {
      // retry on next sync
    }
  }
}

type ServerEquipmentSet = {
  id: string;
  name: string;
  bowType?: string;
  manufacturer?: string;
  model?: string;
  drawWeight?: number | string;
  arrowLength?: string;
  arrowSpine?: string;
  arrowWeight?: string;
  arrowMaterial?: string;
  customFields?: CustomField[];
  createdAt: string;
  updatedAt: string;
};

function serverEquipmentToLocal(serverSet: ServerEquipmentSet): LocalEquipmentSet {
  return {
    id: `server_${serverSet.id}`,
    serverId: serverSet.id,
    isSynced: true,
    name: serverSet.name,
    bowType: serverSet.bowType,
    manufacturer: serverSet.manufacturer,
    model: serverSet.model,
    drawWeight: coerceDrawWeightLbs(serverSet.drawWeight),
    arrowLength: serverSet.arrowLength,
    arrowSpine: serverSet.arrowSpine,
    arrowWeight: serverSet.arrowWeight,
    arrowMaterial: serverSet.arrowMaterial,
    customFields: serverSet.customFields,
    createdAt: serverSet.createdAt,
    updatedAt: serverSet.updatedAt,
  };
}

function applyServerEquipmentFields(
  existing: LocalEquipmentSet,
  serverSet: ServerEquipmentSet,
): LocalEquipmentSet {
  return {
    ...existing,
    name: serverSet.name,
    bowType: serverSet.bowType,
    manufacturer: serverSet.manufacturer,
    model: serverSet.model,
    drawWeight: coerceDrawWeightLbs(serverSet.drawWeight),
    arrowLength: serverSet.arrowLength,
    arrowSpine: serverSet.arrowSpine,
    arrowWeight: serverSet.arrowWeight,
    arrowMaterial: serverSet.arrowMaterial,
    customFields: serverSet.customFields,
    updatedAt: serverSet.updatedAt,
    isSynced: true,
  };
}

export function mergeServerEquipmentSets(serverSets: ServerEquipmentSet[]): void {
  const local = getEquipmentSets();
  const serverIds = new Set(serverSets.map((s) => s.id));

  const filtered = local.filter((item) => !item.serverId || serverIds.has(item.serverId));

  for (const serverSet of serverSets) {
    if (hasTombstone('equipment', serverSet.id)) continue;

    const index = filtered.findIndex((item) => item.serverId === serverSet.id);
    if (index === -1) {
      filtered.push(serverEquipmentToLocal(serverSet));
      continue;
    }

    const existing = filtered[index];
    if (serverSet.updatedAt > existing.updatedAt) {
      filtered[index] = applyServerEquipmentFields(existing, serverSet);
    }
  }

  writeEquipmentSets(filtered);
}

type ServerTrainingSession = {
  id: string;
  date: string;
  status?: string;
  shotsCount?: number;
  arrowsPerSet?: number;
  distance?: string;
  targetType?: string;
  equipmentSetId?: string;
  scoreTotal?: number;
  notes?: string;
  mood?: string;
  customFields?: CustomField[];
  createdAt: string;
  updatedAt: string;
};

function serverSessionToLocal(serverSession: ServerTrainingSession): LocalTrainingSession {
  return {
    id: `server_${serverSession.id}`,
    serverId: serverSession.id,
    isSynced: true,
    date: serverSession.date,
    status: (serverSession.status as TrainingSessionStatus) ?? 'finished',
    shotsCount: serverSession.shotsCount,
    arrowsPerSet: serverSession.arrowsPerSet,
    distance: serverSession.distance,
    targetType: serverSession.targetType,
    equipmentSetId: serverSession.equipmentSetId,
    scoreTotal: serverSession.scoreTotal,
    notes: serverSession.notes,
    mood: serverSession.mood as TrainingMood | undefined,
    customFields: serverSession.customFields,
    createdAt: serverSession.createdAt,
    updatedAt: serverSession.updatedAt,
  };
}

function applyServerSessionFields(
  existing: LocalTrainingSession,
  serverSession: ServerTrainingSession,
): LocalTrainingSession {
  return {
    ...existing,
    date: serverSession.date,
    status: (serverSession.status as TrainingSessionStatus) ?? 'finished',
    shotsCount: serverSession.shotsCount,
    arrowsPerSet: serverSession.arrowsPerSet,
    distance: serverSession.distance,
    targetType: serverSession.targetType,
    equipmentSetId: serverSession.equipmentSetId,
    scoreTotal: serverSession.scoreTotal,
    notes: serverSession.notes,
    mood: serverSession.mood as TrainingMood | undefined,
    customFields: serverSession.customFields,
    updatedAt: serverSession.updatedAt,
    isSynced: true,
  };
}

export function mergeServerTrainingSessions(serverSessions: ServerTrainingSession[]): void {
  const local = getTrainingSessions();
  const serverIds = new Set(serverSessions.map((s) => s.id));

  const filtered = local.filter((item) => !item.serverId || serverIds.has(item.serverId));

  for (const serverSession of serverSessions) {
    if (hasTombstone('training', serverSession.id)) continue;

    const index = filtered.findIndex((item) => item.serverId === serverSession.id);
    if (index === -1) {
      filtered.push(serverSessionToLocal(serverSession));
      continue;
    }

    const existing = filtered[index];
    if (serverSession.updatedAt > existing.updatedAt) {
      filtered[index] = applyServerSessionFields(existing, serverSession);
    }
  }

  writeTrainingSessions(filtered);
}
