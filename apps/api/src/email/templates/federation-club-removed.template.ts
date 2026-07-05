import type { EmailI18n } from '../i18n';
import { interpolate } from '../i18n';
import { styleHeading, styleDangerBox, styleDangerBoxText } from './theme';

export interface FederationClubRemovedContentParams {
  federationName: string;
  clubName: string;
  removedBy: string;
}

export function getFederationClubRemovedContent(
  params: FederationClubRemovedContentParams,
  t: EmailI18n,
): { html: string; text: string } {
  const { federationName, clubName, removedBy } = params;
  const s = t.federationClubRemoved;

  const greeting = interpolate(s.greeting, { federationName });
  const body = interpolate(s.body, { clubName, federationName, removedBy });

  const html = `
    <h2 style="${styleHeading()}">${s.heading}</h2>
    <p>${greeting}</p>
    <div style="${styleDangerBox()}">
      <p style="${styleDangerBoxText()}">${body}</p>
    </div>
  `;

  const text = `
${s.heading}

${greeting}

${body}
`.trim();

  return { html, text };
}
