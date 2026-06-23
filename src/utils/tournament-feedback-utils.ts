const DISMISSED_TOURNAMENT_FEEDBACK_PREFIX = 'dismissedTournamentFeedback_';

export function isTournamentFeedbackDismissed(tournamentId: string): boolean {
  return localStorage.getItem(`${DISMISSED_TOURNAMENT_FEEDBACK_PREFIX}${tournamentId}`) === '1';
}

export function dismissTournamentFeedback(tournamentId: string): void {
  localStorage.setItem(`${DISMISSED_TOURNAMENT_FEEDBACK_PREFIX}${tournamentId}`, '1');
}
