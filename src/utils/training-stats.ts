import type { MonthlyDataPoint } from '../services/types';
import { resolveEquipmentSet } from './equipment-utils';
import type { LocalEquipmentSet, LocalTrainingSession } from './local-data-storage';

export interface EquipmentStatsEntry {
  equipmentSetId: string | null;
  name: string;
  sessions: number;
  shots: number;
  avgShotsPerSession: number;
}

export interface LocalTrainingStats {
  totalSessions: number;
  currentStreakWeeks: number;
  shots: { total: number; thisWeek: number; thisMonth: number; thisYear: number };
  metersTraveled: { total: number; thisMonth: number; thisYear: number };
  avgShotsPerSession: number;
  mostUsedDistance: string | null;
  mostUsedTargetType: string | null;
  mostUsedEquipment: string | null;
  byEquipment: EquipmentStatsEntry[];
  shotsByMonth: MonthlyDataPoint[];
  sessionsByMonth: MonthlyDataPoint[];
}

export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getIsoWeekString(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum =
    1 +
    Math.round(((d.getTime() - week1.getTime()) / 86_400_000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-${weekNum.toString().padStart(2, '0')}`;
}

function getMostFrequent(map: Record<string, number>): string | null {
  const entries = Object.entries(map);
  if (entries.length === 0) return null;
  return [...entries].sort(([, a], [, b]) => b - a)[0][0];
}

interface PeriodAccumulator {
  totalShots: number;
  shotsWeek: number;
  shotsMonth: number;
  shotsYear: number;
  totalMeters: number;
  metersMonth: number;
  metersYear: number;
  distanceCount: Record<string, number>;
  targetTypeCount: Record<string, number>;
  weekSet: Set<string>;
}

function accumulateSession(acc: PeriodAccumulator, s: LocalTrainingSession): void {
  const d = new Date(s.date + 'T00:00:00');
  const now = new Date();
  const weekStart = getStartOfWeek(now);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const shots = s.shotsCount ?? 0;
  const dist = s.distance ? Number.parseFloat(s.distance) : 0;
  const meters = !Number.isNaN(dist) && dist > 0 ? shots * dist * 2 : 0;

  acc.totalShots += shots;
  acc.totalMeters += meters;
  acc.weekSet.add(getIsoWeekString(d));

  if (d >= weekStart) acc.shotsWeek += shots;
  if (d >= monthStart) {
    acc.shotsMonth += shots;
    acc.metersMonth += meters;
  }
  if (d >= yearStart) {
    acc.shotsYear += shots;
    acc.metersYear += meters;
  }
  if (s.distance) acc.distanceCount[s.distance] = (acc.distanceCount[s.distance] ?? 0) + 1;
  if (s.targetType)
    acc.targetTypeCount[s.targetType] = (acc.targetTypeCount[s.targetType] ?? 0) + 1;
}

export function computeStreak(weekSet: Set<string>, referenceDate: Date = new Date()): number {
  return computeStreakAsOf(weekSet, referenceDate);
}

export function buildWeekSetFromSessions(sessions: LocalTrainingSession[]): Set<string> {
  const weekSet = new Set<string>();
  for (const s of sessions) {
    weekSet.add(getIsoWeekString(new Date(`${s.date}T00:00:00`)));
  }
  return weekSet;
}

export function hasSessionInIsoWeek(weekSet: Set<string>, date: Date): boolean {
  return weekSet.has(getIsoWeekString(date));
}

export function computeStreakAsOf(weekSet: Set<string>, date: Date): number {
  let streak = 0;
  const cursor = new Date(date);
  while (weekSet.has(getIsoWeekString(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
}

export interface StreakAtRiskState {
  isAtRisk: boolean;
  priorStreakWeeks: number;
}

export function getStreakAtRiskState(
  weekSet: Set<string>,
  referenceDate: Date = new Date(),
): StreakAtRiskState {
  const hasThisWeek = hasSessionInIsoWeek(weekSet, referenceDate);
  const lastWeek = new Date(referenceDate);
  lastWeek.setDate(lastWeek.getDate() - 7);
  const priorStreakWeeks = computeStreakAsOf(weekSet, lastWeek);
  return {
    isAtRisk: !hasThisWeek && priorStreakWeeks >= 1,
    priorStreakWeeks,
  };
}

/** Prior calendar month stats. Shape matches a future push notification payload. */
export interface PriorMonthSummary {
  monthKey: string;
  sessions: number;
  shots: number;
  mostUsedDistance: string | null;
}

export function computePriorMonthSummary(
  sessions: LocalTrainingSession[],
  referenceDate: Date = new Date(),
): PriorMonthSummary | null {
  const priorMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 1, 1);
  const monthKey = `${priorMonth.getFullYear()}-${(priorMonth.getMonth() + 1).toString().padStart(2, '0')}`;
  const monthSessions = sessions.filter((s) => s.date.slice(0, 7) === monthKey);
  if (monthSessions.length === 0) return null;

  let shots = 0;
  const distanceCount: Record<string, number> = {};
  for (const s of monthSessions) {
    shots += s.shotsCount ?? 0;
    if (s.distance) distanceCount[s.distance] = (distanceCount[s.distance] ?? 0) + 1;
  }

  return {
    monthKey,
    sessions: monthSessions.length,
    shots,
    mostUsedDistance: getMostFrequent(distanceCount),
  };
}

function buildMonthlyPoints(
  sessions: LocalTrainingSession[],
  type: 'shots' | 'sessions',
): MonthlyDataPoint[] {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    const m = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    const count = sessions
      .filter((s) => s.date.slice(0, 7) === m)
      .reduce((sum, s) => sum + (type === 'shots' ? (s.shotsCount ?? 0) : 1), 0);
    return { month: m, count };
  });
}

function computeEquipmentStats(
  sessions: LocalTrainingSession[],
  equipmentSets: LocalEquipmentSet[],
  unspecifiedLabel: string,
): { byEquipment: EquipmentStatsEntry[]; mostUsedEquipment: string | null } {
  const groups = new Map<string | null, { sessions: number; shots: number }>();

  for (const session of sessions) {
    const resolved = resolveEquipmentSet(session.equipmentSetId, equipmentSets);
    const key = resolved?.id ?? session.equipmentSetId ?? null;
    const current = groups.get(key) ?? { sessions: 0, shots: 0 };
    current.sessions += 1;
    current.shots += session.shotsCount ?? 0;
    groups.set(key, current);
  }

  const byEquipment: EquipmentStatsEntry[] = [...groups.entries()]
    .map(([equipmentSetId, data]) => {
      const set = equipmentSetId
        ? (resolveEquipmentSet(equipmentSetId, equipmentSets) ??
          equipmentSets.find((s) => s.id === equipmentSetId))
        : undefined;
      const name = set?.name ?? (equipmentSetId ? equipmentSetId : unspecifiedLabel);
      return {
        equipmentSetId: set?.id ?? (equipmentSetId && !set ? equipmentSetId : null),
        name,
        sessions: data.sessions,
        shots: data.shots,
        avgShotsPerSession: data.sessions > 0 ? Math.round(data.shots / data.sessions) : 0,
      };
    })
    .sort((a, b) => b.shots - a.shots);

  const namedSets = byEquipment.filter((e) => e.equipmentSetId !== null);
  const top = namedSets.length > 0 ? namedSets[0] : byEquipment[0];
  const mostUsedEquipment = top && top.equipmentSetId !== null ? top.name : null;

  return { byEquipment, mostUsedEquipment };
}

export function computeLocalStats(
  sessions: LocalTrainingSession[],
  equipmentSets: LocalEquipmentSet[] = [],
  unspecifiedLabel = 'Unspecified',
): LocalTrainingStats {
  const acc: PeriodAccumulator = {
    totalShots: 0,
    shotsWeek: 0,
    shotsMonth: 0,
    shotsYear: 0,
    totalMeters: 0,
    metersMonth: 0,
    metersYear: 0,
    distanceCount: {},
    targetTypeCount: {},
    weekSet: new Set(),
  };

  for (const s of sessions) accumulateSession(acc, s);

  const { byEquipment, mostUsedEquipment } = computeEquipmentStats(
    sessions,
    equipmentSets,
    unspecifiedLabel,
  );

  return {
    totalSessions: sessions.length,
    currentStreakWeeks: computeStreak(acc.weekSet),
    shots: {
      total: acc.totalShots,
      thisWeek: acc.shotsWeek,
      thisMonth: acc.shotsMonth,
      thisYear: acc.shotsYear,
    },
    metersTraveled: {
      total: Math.round(acc.totalMeters),
      thisMonth: Math.round(acc.metersMonth),
      thisYear: Math.round(acc.metersYear),
    },
    avgShotsPerSession: sessions.length > 0 ? Math.round(acc.totalShots / sessions.length) : 0,
    mostUsedDistance: getMostFrequent(acc.distanceCount),
    mostUsedTargetType: getMostFrequent(acc.targetTypeCount),
    mostUsedEquipment,
    byEquipment,
    shotsByMonth: buildMonthlyPoints(sessions, 'shots'),
    sessionsByMonth: buildMonthlyPoints(sessions, 'sessions'),
  };
}

export function getMostRecentSession(
  sessions: LocalTrainingSession[],
): LocalTrainingSession | null {
  if (sessions.length === 0) return null;
  return getRecentTrainingSessions(sessions, 1)[0] ?? null;
}

export function getRecentTrainingSessions(
  sessions: LocalTrainingSession[],
  limit = 3,
): LocalTrainingSession[] {
  return [...sessions]
    .sort((a, b) => {
      const dateCmp = b.date.localeCompare(a.date);
      if (dateCmp !== 0) return dateCmp;
      return b.createdAt.localeCompare(a.createdAt);
    })
    .slice(0, limit);
}

export function getLastLoggedSession(
  sessions: LocalTrainingSession[],
): LocalTrainingSession | null {
  if (sessions.length === 0) return null;
  return [...sessions].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}

export function toSessionFormDefaults(
  session: LocalTrainingSession,
  defaultEquipmentSetId?: string | null,
): Partial<LocalTrainingSession> {
  const today = new Date().toISOString().slice(0, 10);
  return {
    date: today,
    distance: session.distance,
    targetType: session.targetType,
    equipmentSetId: session.equipmentSetId ?? defaultEquipmentSetId ?? undefined,
  };
}
