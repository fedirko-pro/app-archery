'use client';

import Script from 'next/script';

import { GA_MEASUREMENT_ID, isAnalyticsEnabled } from './gtag';

export function GoogleAnalytics() {
  if (!isAnalyticsEnabled) {
    return null;
  }

  return (
    <>
      <Script
        id="ga-script"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script id="ga-config" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_MEASUREMENT_ID}');`}
      </Script>
    </>
  );
}
