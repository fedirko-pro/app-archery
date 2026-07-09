import type { EmailI18n } from '../i18n';
import { interpolate } from '../i18n';
import { styleHeading } from './theme';

export interface ClubJoinRequestRejectedParams {
  name: string;
  clubName: string;
}

export function getClubJoinRequestRejectedContent(
  params: ClubJoinRequestRejectedParams,
  t: EmailI18n,
): { html: string; text: string } {
  const { name, clubName } = params;
  const s = t.clubJoinRequestRejected;
  const greeting = interpolate(s.greeting, { name });

  const html = `
    <h2 style="${styleHeading()}">${s.heading}</h2>
    <p>${greeting}</p>
    <p>${interpolate(s.body, { clubName })}</p>
    <p>${s.note}</p>
  `;

  const text = `
${s.heading}

${greeting}

${interpolate(s.body, { clubName })}

${s.note}
`.trim();

  return { html, text };
}
