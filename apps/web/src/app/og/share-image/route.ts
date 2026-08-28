import { NextResponse } from 'next/server';

import { isOgImageProxyAllowed } from '@/lib/share-og-image';
import { SITE_OG_IMAGE_PATH } from '@/lib/site-metadata';

const MAX_BYTES = 5 * 1024 * 1024;

export async function GET(request: Request) {
  const src = new URL(request.url).searchParams.get('src');
  if (!src || !isOgImageProxyAllowed(src)) {
    return NextResponse.redirect(new URL(SITE_OG_IMAGE_PATH, request.url), 302);
  }

  try {
    const upstream = await fetch(src, {
      headers: {
        Accept: 'image/*',
        'User-Agent': 'Mozilla/5.0 (compatible; SokilOG/1.0)',
      },
      redirect: 'follow',
      cache: 'force-cache',
    });

    if (!upstream.ok) {
      return NextResponse.redirect(new URL(SITE_OG_IMAGE_PATH, request.url), 302);
    }

    const contentType = upstream.headers.get('content-type') ?? '';
    if (!contentType.startsWith('image/')) {
      return NextResponse.redirect(new URL(SITE_OG_IMAGE_PATH, request.url), 302);
    }

    const body = await upstream.arrayBuffer();
    if (body.byteLength === 0 || body.byteLength > MAX_BYTES) {
      return NextResponse.redirect(new URL(SITE_OG_IMAGE_PATH, request.url), 302);
    }

    return new NextResponse(body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch {
    return NextResponse.redirect(new URL(SITE_OG_IMAGE_PATH, request.url), 302);
  }
}
