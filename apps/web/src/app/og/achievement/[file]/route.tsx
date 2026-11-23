import { ACHIEVEMENT_CATALOG_BY_ID } from '@sokil/shared-types';
import { ImageResponse } from 'next/og';

import { createServerTranslate } from '@/lib/server-i18n';
import { RARITY_COLORS } from '@/theme/achievementTokens';
import { COLORS } from '@/theme/colors';

// Image text is always English: the default next/og font has no Cyrillic glyphs.
export async function GET(request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const id = file.replace(/\.png$/i, '');
  const def = ACHIEVEMENT_CATALOG_BY_ID[id];
  if (!def) {
    return new Response('Not found', { status: 404 });
  }

  const t = createServerTranslate('en');
  const title = t(def.titleKey);
  const host =
    request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? 'sokil.app';
  const rarity = RARITY_COLORS[def.rarity] ?? RARITY_COLORS.common;

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: COLORS.primary,
        color: '#ffffff',
        padding: 40,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 290,
          height: 290,
          borderRadius: 145,
          background: rarity.bgGradient,
          fontSize: 170,
        }}
      >
        {def.icon}
      </div>
      <div
        style={{
          display: 'flex',
          fontSize: 84,
          fontWeight: 700,
          marginTop: 30,
          textAlign: 'center',
        }}
      >
        {title}
      </div>
      <div style={{ display: 'flex', fontSize: 44, marginTop: 24, opacity: 0.92 }}>
        {`Earn achievements in Sokil · ${host}`}
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      headers: { 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800' },
    },
  );
}
