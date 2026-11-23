import { ACHIEVEMENT_CATALOG_BY_ID } from '@sokil/shared-types';
import { ImageResponse } from 'next/og';

const RARITY_COLORS: Record<string, string> = {
  common: '#9E9E9E',
  rare: '#2196F3',
  epic: '#9C27B0',
  legendary: '#FF9800',
};

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const id = file.replace(/\.png$/i, '');
  const def = ACHIEVEMENT_CATALOG_BY_ID[id];
  if (!def) {
    return new Response('Not found', { status: 404 });
  }

  const color = RARITY_COLORS[def.rarity] ?? RARITY_COLORS.common;
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${color}, #1b1b1b)`,
        fontSize: 320,
      }}
    >
      {def.icon}
    </div>,
    {
      width: 1200,
      height: 630,
      headers: { 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800' },
    },
  );
}
