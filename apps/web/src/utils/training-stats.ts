import { lbsToKg } from '@sokil/shared-types';
import { format, parseISO } from 'date-fns';

import type { MonthlyDataPoint } from '../services/types';
import { resolveEquipmentSet } from './equipment-utils';
import type { LocalEquipmentSet, LocalTrainingSession } from './local-data-storage';
import { isSessionFinished } from './training-session-utils';

export interface ScoreStatsEntry {
  distance: string;
  avgScore: number;
  count: number;
}

export interface BestSessionEntry {
  score: number;
  date: string;
  distance?: string;
}

export interface ScoringStats {
  avgScore: number | null;
  bestSession: BestSessionEntry | null;
  avgScoreByDistance: ScoreStatsEntry[];
}

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
  bestStreakWeeks: number;
  shots: { total: number; thisWeek: number; thisMonth: number; thisYear: number };
  metersTraveled: { total: number; thisMonth: number; thisYear: number };
  kilogramsLifted: number;
  avgShotsPerSession: number;
  mostUsedDistance: string | null;
  mostUsedTargetType: string | null;
  mostUsedEquipment: string | null;
  byEquipment: EquipmentStatsEntry[];
  shotsByMonth: MonthlyDataPoint[];
  sessionsByMonth: MonthlyDataPoint[];
  scoring: ScoringStats;
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

export function computeBestStreakWeeks(weekSet: Set<string>): number {
  if (weekSet.size === 0) return 0;

  const sortedWeeks = [...weekSet].sort();
  let best = 1;
  let current = 1;

  for (let i = 1; i < sortedWeeks.length; i++) {
    const prevDate = isoWeekToDate(sortedWeeks[i - 1]);
    const currDate = isoWeekToDate(sortedWeeks[i]);
    const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / 86_400_000);
    if (diffDays === 7) {
      current++;
      best = Math.max(best, current);
    } else {
      current = 1;
    }
  }

  return best;
}

function isoWeekToDate(isoWeek: string): Date {
  const [yearStr, weekStr] = isoWeek.split('-');
  const year = Number.parseInt(yearStr, 10);
  const week = Number.parseInt(weekStr, 10);
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay() || 7;
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - dayOfWeek + 1 + (week - 1) * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
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

/**
 * Total kilograms drawn: each shot lifts the bow's draw weight once.
 * Draw weight is stored in pounds; converted to kg. Sessions with no equipment
 * set or no draw weight contribute 0.
 */
function computeKilogramsLifted(
  sessions: LocalTrainingSession[],
  equipmentSets: LocalEquipmentSet[],
): number {
  let total = 0;
  for (const session of sessions) {
    const shots = session.shotsCount ?? 0;
    if (shots <= 0) continue;
    const set = resolveEquipmentSet(session.equipmentSetId, equipmentSets);
    const kg = lbsToKg(set?.drawWeight);
    if (kg > 0) total += shots * kg;
  }
  return Math.round(total);
}

function computeScoringStats(sessions: LocalTrainingSession[]): ScoringStats {
  const scored = sessions.filter((s) => s.scoreTotal !== undefined && s.scoreTotal !== null);
  if (scored.length === 0) {
    return { avgScore: null, bestSession: null, avgScoreByDistance: [] };
  }

  const totalScore = scored.reduce((sum, s) => sum + (s.scoreTotal ?? 0), 0);
  const best = [...scored].sort((a, b) => {
    const scoreDiff = (b.scoreTotal ?? 0) - (a.scoreTotal ?? 0);
    if (scoreDiff !== 0) return scoreDiff;
    return b.date.localeCompare(a.date);
  })[0];

  const byDistance = new Map<string, { total: number; count: number }>();
  for (const s of scored) {
    if (!s.distance) continue;
    const current = byDistance.get(s.distance) ?? { total: 0, count: 0 };
    current.total += s.scoreTotal ?? 0;
    current.count += 1;
    byDistance.set(s.distance, current);
  }

  const avgScoreByDistance: ScoreStatsEntry[] = [...byDistance.entries()]
    .map(([distance, data]) => ({
      distance,
      avgScore: Math.round((data.total / data.count) * 10) / 10,
      count: data.count,
    }))
    .sort((a, b) => Number.parseFloat(a.distance) - Number.parseFloat(b.distance));

  return {
    avgScore: Math.round((totalScore / scored.length) * 10) / 10,
    bestSession: best
      ? { score: best.scoreTotal ?? 0, date: best.date, distance: best.distance }
      : null,
    avgScoreByDistance,
  };
}

export function computeLocalStats(
  sessions: LocalTrainingSession[],
  equipmentSets: LocalEquipmentSet[] = [],
  unspecifiedLabel = 'Unspecified',
): LocalTrainingStats {
  const finishedSessions = sessions.filter(isSessionFinished);

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

  for (const s of finishedSessions) accumulateSession(acc, s);

  const { byEquipment, mostUsedEquipment } = computeEquipmentStats(
    finishedSessions,
    equipmentSets,
    unspecifiedLabel,
  );

  const scoring = computeScoringStats(finishedSessions);

  return {
    totalSessions: finishedSessions.length,
    currentStreakWeeks: computeStreak(acc.weekSet),
    bestStreakWeeks: computeBestStreakWeeks(acc.weekSet),
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
    kilogramsLifted: computeKilogramsLifted(finishedSessions, equipmentSets),
    avgShotsPerSession:
      finishedSessions.length > 0 ? Math.round(acc.totalShots / finishedSessions.length) : 0,
    mostUsedDistance: getMostFrequent(acc.distanceCount),
    mostUsedTargetType: getMostFrequent(acc.targetTypeCount),
    mostUsedEquipment,
    byEquipment,
    shotsByMonth: buildMonthlyPoints(finishedSessions, 'shots'),
    sessionsByMonth: buildMonthlyPoints(finishedSessions, 'sessions'),
    scoring,
  };
}

export function getMostRecentSession(
  sessions: LocalTrainingSession[],
): LocalTrainingSession | null {
  if (sessions.length === 0) return null;
  return getRecentTrainingSessions(sessions, 1)[0] ?? null;
}

/** Newest training date first; same-day sessions ordered by createdAt descending. */
export function sortTrainingSessionsNewestFirst(
  sessions: LocalTrainingSession[],
): LocalTrainingSession[] {
  return [...sessions].sort((a, b) => {
    const dateCmp = b.date.localeCompare(a.date);
    if (dateCmp !== 0) return dateCmp;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export function getRecentTrainingSessions(
  sessions: LocalTrainingSession[],
  limit = 3,
): LocalTrainingSession[] {
  return sortTrainingSessionsNewestFirst(sessions).slice(0, limit);
}

/** Training date plus logged time, e.g. "18 Jul 2026, 14:30". */
export function formatTrainingSessionDateTime(session: {
  date: string;
  createdAt: string;
}): string {
  try {
    const datePart = format(parseISO(session.date), 'dd MMM yyyy');
    const timePart = format(parseISO(session.createdAt), 'HH:mm');
    return `${datePart}, ${timePart}`;
  } catch {
    return session.date;
  }
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
