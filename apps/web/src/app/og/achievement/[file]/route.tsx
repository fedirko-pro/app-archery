import { ACHIEVEMENT_CATALOG_BY_ID } from '@sokil/shared-types';
import { ImageResponse } from 'next/og';

import { getRarityStyle } from '@/theme/achievementTokens';
import { COLORS } from '@/theme/colors';

/** Mix a #rrggbb colour towards a target channel value (0 = black, 255 = white). */
function mix(hex: string, target: number, amount: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) =>
    Math.round(c + (target - c) * amount),
  );
  return `rgb(${ch[0]}, ${ch[1]}, ${ch[2]})`;
}

// No text on purpose: the title/description/CTA come from the og: meta tags.
// Badge mirrors components/achievements/AchievementMedallion.tsx (gradient ring ~4% wide,
// near-white inner disc, emoji at 45% of the diameter, rarity glow).
export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const id = file.replace(/\.png$/i, '');
  const def = ACHIEVEMENT_CATALOG_BY_ID[id];
  if (!def) {
    return new Response('Not found', { status: 404 });
  }

  const rarity = getRarityStyle(def.rarity);
  const size = 440;
  const ring = Math.round(size * 0.04);
  const inner = size - ring * 2;

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `radial-gradient(circle at 50% 45%, ${mix(COLORS.primary, 255, 0.3)} 0%, ${COLORS.primary} 45%, ${mix(COLORS.primary, 0, 0.6)} 100%)`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size,
          height: size,
          borderRadius: size / 2,
          background: rarity.bgGradient,
          boxShadow: `0 0 60px ${rarity.glow}, 0 12px 32px rgba(0,0,0,0.35)`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: inner,
            height: inner,
            borderRadius: inner / 2,
            background: 'rgba(255,255,255,0.95)',
            fontSize: Math.round(size * 0.45),
          }}
        >
          {def.icon}
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      headers: { 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800' },
    },
  );
}
