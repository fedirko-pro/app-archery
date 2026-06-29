import { isBefore, parseISO, startOfDay } from 'date-fns';

import type { TournamentDto } from '../services/types';

export function isPastTournament(tournament: { endDate?: string; startDate: string }): boolean {
  const today = startOfDay(new Date());
  const tournamentEndDate = tournament.endDate
    ? parseISO(tournament.endDate)
    : parseISO(tournament.startDate);
  return isBefore(startOfDay(tournamentEndDate), today);
}

export function isUpcomingTournament(tournament: { endDate?: string; startDate: string }): boolean {
  return !isPastTournament(tournament);
}

export function filterTournamentsClient(
  tournaments: TournamentDto[],
  params?: { country?: string; upcoming?: boolean },
): TournamentDto[] {
  let result = tournaments;

  if (params?.country) {
    result = result.filter((t) => t.country === params.country);
  }

  if (params?.upcoming === true) {
    result = result.filter((t) => isUpcomingTournament(t));
  } else if (params?.upcoming === false) {
    result = result.filter((t) => isPastTournament(t));
  }

  return result;
}
