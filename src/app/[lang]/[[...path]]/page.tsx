import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

import LangCatchAllClient from './LangCatchAllClient';
import { fetchTournamentForMetadata } from '@/lib/server-api';
import {
  buildTournamentMetadata,
  buildTournamentNotFoundMetadata,
  resolveSiteUrl,
} from '@/lib/tournament-metadata';
import { getTournamentIdFromPath } from '@/lib/tournament-route';

interface LangCatchAllPageProps {
  params: Promise<{ lang: string; path?: string[] }>;
}

export async function generateMetadata({ params }: LangCatchAllPageProps): Promise<Metadata> {
  const { lang, path } = await params;
  const tournamentId = getTournamentIdFromPath(path);

  if (!tournamentId) {
    return {};
  }

  const tournament = await fetchTournamentForMetadata(tournamentId);
  if (!tournament) {
    return buildTournamentNotFoundMetadata();
  }

  const headersList = await headers();
  const siteUrl = resolveSiteUrl(headersList);
  return buildTournamentMetadata(tournament, lang, siteUrl);
}

export default async function LangCatchAllPage({ params }: LangCatchAllPageProps) {
  const { path } = await params;
  const tournamentId = getTournamentIdFromPath(path);

  if (tournamentId) {
    const tournament = await fetchTournamentForMetadata(tournamentId);
    if (!tournament) {
      notFound();
    }
  }

  return <LangCatchAllClient />;
}
