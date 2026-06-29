const DISMISSED_TOURNAMENT_FEEDBACK_PREFIX = 'dismissedTournamentFeedback_';

export function isTournamentFeedbackDismissed(tournamentId: string): boolean {
  return localStorage.getItem(`${DISMISSED_TOURNAMENT_FEEDBACK_PREFIX}${tournamentId}`) === '1';
}

export function dismissTournamentFeedback(tournamentId: string): void {
  localStorage.setItem(`${DISMISSED_TOURNAMENT_FEEDBACK_PREFIX}${tournamentId}`, '1');
}

/** Mirrors backend feedback window: open after the tournament end date. */
export function isTournamentFeedbackWindowOpen(tournament: {
  startDate: string;
  endDate?: string | null;
}): boolean {
  const endDateRaw = tournament.endDate ?? tournament.startDate;
  const endDate = new Date(endDateRaw);
  const today = new Date();
  endDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return endDate < today;
}
