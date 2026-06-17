import type { MonthlyDataPoint } from '../services/types';
import type { LocalTrainingSession } from './local-data-storage';

export interface LocalTrainingStats {
  totalSessions: number;
  currentStreakWeeks: number;
  shots: { total: number; thisWeek: number; thisMonth: number; thisYear: number };
  metersTraveled: { total: number; thisMonth: number; thisYear: number };
  avgShotsPerSession: number;
  mostUsedDistance: string | null;
  mostUsedTargetType: string | null;
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

export function computeStreak(weekSet: Set<string>): number {
  let streak = 0;
  const cursor = new Date();
  while (weekSet.has(getIsoWeekString(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
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

export function computeLocalStats(sessions: LocalTrainingSession[]): LocalTrainingStats {
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
    shotsByMonth: buildMonthlyPoints(sessions, 'shots'),
    sessionsByMonth: buildMonthlyPoints(sessions, 'sessions'),
  };
}

export function getMostRecentSession(
  sessions: LocalTrainingSession[],
): LocalTrainingSession | null {
  if (sessions.length === 0) return null;
  return [...sessions].sort((a, b) => b.date.localeCompare(a.date))[0];
}
