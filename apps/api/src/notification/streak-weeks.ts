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

export function getStartOfIsoWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function computeStreakAsOf(weekSet: Set<string>, date: Date): number {
  let streak = 0;
  const cursor = new Date(date);
  while (weekSet.has(getIsoWeekString(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
}

export function getStreakAtRiskState(
  weekSet: Set<string>,
  referenceDate: Date = new Date(),
): { isAtRisk: boolean; priorStreakWeeks: number } {
  const hasThisWeek = weekSet.has(getIsoWeekString(referenceDate));
  const lastWeek = new Date(referenceDate);
  lastWeek.setDate(lastWeek.getDate() - 7);
  const priorStreakWeeks = computeStreakAsOf(weekSet, lastWeek);
  return {
    isAtRisk: !hasThisWeek && priorStreakWeeks >= 1,
    priorStreakWeeks,
  };
}

export function sessionInstant(value: string | Date): Date {
  if (value instanceof Date) {
    const year = value.getUTCFullYear();
    const month = String(value.getUTCMonth() + 1).padStart(2, '0');
    const day = String(value.getUTCDate()).padStart(2, '0');
    return new Date(`${year}-${month}-${day}T00:00:00`);
  }
  return new Date(`${String(value).slice(0, 10)}T00:00:00`);
}
