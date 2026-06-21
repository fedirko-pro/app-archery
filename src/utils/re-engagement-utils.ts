const DISMISSED_STREAK_AT_RISK_KEY = 'dismissedStreakAtRisk';
const DISMISSED_MONTHLY_SUMMARY_PREFIX = 'dismissedMonthlySummary_';

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

/** True if the user dismissed the streak-at-risk prompt earlier today. Resets each calendar day. */
export function isStreakAtRiskDismissed(): boolean {
  const dismissedOn = localStorage.getItem(DISMISSED_STREAK_AT_RISK_KEY);
  return dismissedOn === getTodayDateString();
}

/** Hide the streak-at-risk prompt until tomorrow. */
export function dismissStreakAtRisk(): void {
  localStorage.setItem(DISMISSED_STREAK_AT_RISK_KEY, getTodayDateString());
}

export function isMonthlySummaryDismissed(monthKey: string): boolean {
  return localStorage.getItem(`${DISMISSED_MONTHLY_SUMMARY_PREFIX}${monthKey}`) === '1';
}

export function dismissMonthlySummary(monthKey: string): void {
  localStorage.setItem(`${DISMISSED_MONTHLY_SUMMARY_PREFIX}${monthKey}`, '1');
}

/** Show prior-month summary during the first 7 days of the current month. */
export function isMonthlySummaryWindow(referenceDate: Date = new Date()): boolean {
  return referenceDate.getDate() <= 7;
}
