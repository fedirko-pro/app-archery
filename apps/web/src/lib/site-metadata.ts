import type { Metadata } from 'next';

import { alternateOgLocales, toOgLocale } from './og-locale';

export const SITE_NAME = 'Sokil';
export const SITE_TITLE = 'Sokil APP';
export const SITE_DESCRIPTION = 'Sokil archery tournament and training app';
export const SITE_OG_IMAGE_PATH = '/og/og-image.png';
export const SITE_OG_IMAGE_WIDTH = 1200;
export const SITE_OG_IMAGE_HEIGHT = 630;

export function resolveSiteOgImage(siteUrl: string): string {
  return new URL(SITE_OG_IMAGE_PATH, siteUrl).toString();
}

interface SiteMetadataOptions {
  lang: string;
  siteUrl: string;
  url?: string;
}

export function buildSiteMetadata({ lang, siteUrl, url }: SiteMetadataOptions): Metadata {
  return {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    ...(url ? { alternates: { canonical: url } } : {}),
    openGraph: {
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      ...(url ? { url } : {}),
      siteName: SITE_NAME,
      type: 'website',
      locale: toOgLocale(lang),
      alternateLocale: alternateOgLocales(lang),
      images: [
        {
          url: resolveSiteOgImage(siteUrl),
          width: SITE_OG_IMAGE_WIDTH,
          height: SITE_OG_IMAGE_HEIGHT,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      images: [resolveSiteOgImage(siteUrl)],
    },
  };
}
