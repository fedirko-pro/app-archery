import type { EmailI18n } from '../i18n';
import { interpolate } from '../i18n';
import { styleHeading, styleNeutralBox } from './theme';

export interface FederationClubJoinedContentParams {
  federationName: string;
  clubName: string;
}

export function getFederationClubJoinedContent(
  params: FederationClubJoinedContentParams,
  t: EmailI18n,
): { html: string; text: string } {
  const { federationName, clubName } = params;
  const s = t.federationClubJoined;

  const greeting = interpolate(s.greeting, { federationName });
  const body = interpolate(s.body, { clubName, federationName });

  const html = `
    <h2 style="${styleHeading()}">${s.heading}</h2>
    <p>${greeting}</p>
    <p>${body}</p>
  `;

  const text = `
${s.heading}

${greeting}

${body}
`.trim();

  return { html, text };
}
