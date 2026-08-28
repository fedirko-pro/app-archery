import { describe, expect, it } from 'vitest';

import type {
  PublicAchievementShareDto,
  PublicProfileDto,
  PublicProgressShareDto,
} from '@/services/types';
import {
  buildAchievementShareMetadata,
  buildProgressShareMetadata,
  buildPublicProfileMetadata,
} from './public-profile-metadata';
import { createServerTranslate } from './server-i18n';

const SITE_URL = 'https://sokil.app';

const owner = {
  id: 'owner-1',
  firstName: 'Serhii',
  lastName: 'Fedirko',
};

const achievement: PublicAchievementShareDto = {
  id: 'streak-2-weeks',
  titleKey: 'achievements.streak2Weeks.title',
  descriptionKey: 'achievements.streak2Weeks.description',
  icon: 'flame',
  rarity: 'common',
  earned: true,
  owner,
};

describe('buildAchievementShareMetadata', () => {
  it('translates the title and description instead of leaking i18n keys', () => {
    const metadata = buildAchievementShareMetadata(
      achievement,
      'en',
      SITE_URL,
      createServerTranslate('en'),
    );

    expect(metadata.openGraph?.title).toBe('New achievement: Warming Up — Serhii Fedirko');
    expect(metadata.description).toBe('Train at least once a week for 2 weeks in a row');
    expect(JSON.stringify(metadata)).not.toContain('achievements.streak2Weeks');
  });

  it('uses the language of the shared link', () => {
    const metadata = buildAchievementShareMetadata(
      achievement,
      'ua',
      SITE_URL,
      createServerTranslate('ua'),
    );

    expect(metadata.openGraph?.title).toBe('Нове досягнення: Розминка — Serhii Fedirko');
    expect(metadata.openGraph?.locale).toBe('uk_UA');
  });

  it('points the canonical url at the lang-prefixed share route', () => {
    const metadata = buildAchievementShareMetadata(
      achievement,
      'de',
      SITE_URL,
      createServerTranslate('de'),
    );

    expect(metadata.alternates?.canonical).toBe(
      'https://sokil.app/de/archers/owner-1/achievements/streak-2-weeks',
    );
  });

  it('uses the branded site image when the icon is not a picture and there is no avatar', () => {
    const metadata = buildAchievementShareMetadata(
      achievement,
      'en',
      SITE_URL,
      createServerTranslate('en'),
    );

    expect(metadata.openGraph?.images).toEqual([
      {
        url: 'https://sokil.app/og/og-image-v2.png',
        width: 1200,
        height: 630,
        alt: 'Warming Up',
      },
    ]);
  });

  it('proxies a Google avatar for the Open Graph image', () => {
    const metadata = buildAchievementShareMetadata(
      {
        ...achievement,
        owner: {
          ...owner,
          picture: 'https://lh3.googleusercontent.com/a/ACg8ocKexample=s96-c',
        },
      },
      'en',
      SITE_URL,
      createServerTranslate('en'),
    );
    const serialized = JSON.stringify(metadata.openGraph?.images);

    expect(serialized).toContain('https://sokil.app/og/share-image?src=');
    expect(serialized).toContain('s512-c');
  });
});

describe('buildProgressShareMetadata', () => {
  const progress: PublicProgressShareDto = {
    id: 'owner-1',
    earnedCount: 3,
    totalCount: 12,
    percent: 25,
    topAchievements: [],
    owner,
  };

  it('localizes the title and description', () => {
    const metadata = buildProgressShareMetadata(
      progress,
      'en',
      SITE_URL,
      createServerTranslate('en'),
    );

    expect(metadata.openGraph?.title).toBe("Serhii Fedirko's achievements on Sokil");
    expect(metadata.description).toBe('3 of 12 achievements unlocked (25%)');
  });
});

describe('buildPublicProfileMetadata', () => {
  const profile: PublicProfileDto = {
    id: 'owner-1',
    firstName: 'Serhii',
    lastName: 'Fedirko',
    profileVisibility: 'public',
    progress: { shotsThisWeek: 120, currentStreakWeeks: 2 } as PublicProfileDto['progress'],
  };

  it('localizes the fallback description', () => {
    const metadata = buildPublicProfileMetadata(
      profile,
      'en',
      SITE_URL,
      createServerTranslate('en'),
    );

    expect(metadata.description).toBe('120 arrows this week · 2-week streak on Sokil');
    expect(metadata.openGraph?.title).toBe('Serhii Fedirko on Sokil');
  });

  it('prefers the bio when present', () => {
    const metadata = buildPublicProfileMetadata(
      { ...profile, bio: '  Field archer  ' },
      'en',
      SITE_URL,
      createServerTranslate('en'),
    );

    expect(metadata.description).toBe('Field archer');
  });
});
