import { describe, expect, it } from 'vitest';

import type { TournamentDto } from '@/services/types';

import {
  buildTournamentMetadata,
  descriptionForLinkPreview,
  toBannerJpegUrl,
} from './tournament-metadata';

const SITE = 'https://sokil.app';
const TOURNAMENT_ID = 'd4f50907-34c6-4b5a-b4e8-5895270536f1';

function tournament(overrides: Partial<TournamentDto> = {}): TournamentDto {
  return {
    id: TOURNAMENT_ID,
    title: 'VII Campeonato dos Castelos FABP26',
    startDate: '2026-10-18T09:00:00.000Z',
    endDate: '2026-10-18T09:00:00.000Z',
    createdAt: '2026-10-08T00:00:00.000Z',
    ...overrides,
  };
}

describe('descriptionForLinkPreview', () => {
  it('removes links and keeps the surrounding text', () => {
    const text = [
      'Local: Castelo Templário de Tomar',
      'https://maps.app.goo.gl/dbPjYW5MePkkQ7oS6',
      '',
      'Horários',
      '09:30 — Início da prova',
    ].join('\n');

    expect(descriptionForLinkPreview(text)).toBe(
      ['Local: Castelo Templário de Tomar', '', 'Horários', '09:30 — Início da prova'].join('\n'),
    );
  });

  it('returns empty when the description is only a link', () => {
    expect(descriptionForLinkPreview('  https://maps.app.goo.gl/abc  ')).toBe('');
  });
});

describe('toBannerJpegUrl', () => {
  it('points chat crawlers at the jpeg rendition of a stored banner', () => {
    expect(
      toBannerJpegUrl(`https://api.sokil.app/uploads/images/banners/${TOURNAMENT_ID}.webp`),
    ).toBe(`https://api.sokil.app/tournaments/${TOURNAMENT_ID}/og-image.jpg`);
  });

  it('leaves non-banner images alone', () => {
    expect(toBannerJpegUrl('https://sokil.app/og/default-tournament-banner.png')).toBeNull();
  });
});

describe('buildTournamentMetadata', () => {
  it('uses the short description and banner for the preview', () => {
    const metadata = buildTournamentMetadata(
      tournament({
        shortDescription: 'Historical bow tournament in Tomar',
        description: 'Local: Tomar\nhttps://maps.app.goo.gl/dbPjYW5MePkkQ7oS6\n\nHorários',
        banner: `https://api.sokil.app/uploads/images/banners/${TOURNAMENT_ID}.webp`,
      }),
      'pt',
      SITE,
    );

    expect(metadata.description).toBe('Historical bow tournament in Tomar');
    expect(metadata.description).not.toContain('maps.app.goo.gl');
    expect(metadata.description).not.toContain('Horários');
    expect(metadata.openGraph?.description).not.toContain('http');
    expect(metadata.openGraph?.images).toEqual([
      {
        url: `https://api.sokil.app/tournaments/${TOURNAMENT_ID}/og-image.jpg`,
        width: 1200,
        height: 400,
        alt: 'VII Campeonato dos Castelos FABP26',
        type: 'image/jpeg',
      },
    ]);
  });

  it('ignores the full description when no short description is set', () => {
    const metadata = buildTournamentMetadata(
      tournament({
        description: 'https://maps.app.goo.gl/abc\nHorários',
        address: 'Tomar',
      }),
      'en',
      SITE,
    );

    expect(metadata.description).not.toContain('maps.app.goo.gl');
    expect(metadata.description).not.toContain('Horários');
    expect(metadata.description).toContain('Tomar');
  });

  it('uses the default image when the tournament has no banner', () => {
    const metadata = buildTournamentMetadata(tournament(), 'en', SITE);
    expect(metadata.openGraph?.images).toEqual([
      {
        url: 'https://sokil.app/og/default-tournament-banner.png',
        width: 400,
        height: 400,
        alt: 'VII Campeonato dos Castelos FABP26',
        type: 'image/png',
      },
    ]);
  });
});
