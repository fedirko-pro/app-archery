import type { EmailI18n } from '../i18n';
import { interpolate } from '../i18n';
import { styleHeading, styleDangerBox, styleDangerBoxText } from './theme';

export interface ClubLeftContentParams {
  userName: string;
  clubName: string;
  profileUrl: string;
}

export function getClubLeftContent(
  params: ClubLeftContentParams,
  t: EmailI18n,
): { html: string; text: string } {
  const { userName, clubName, profileUrl } = params;
  const s = t.clubLeft;

  const greeting = interpolate(s.greeting, { clubName });
  const body = interpolate(s.body, { userName, clubName });

  const html = `
    <h2 style="${styleHeading()}">${s.heading}</h2>
    <p>${greeting}</p>
    <p>${body}</p>
    <div style="${styleDangerBox()}">
      <p style="${styleDangerBoxText()}">
        ${interpolate(s.viewProfile, { profileUrl })}
      </p>
    </div>
  `;

  const text = `
${s.heading}

${greeting}

${body}

${profileUrl}
`.trim();

  return { html, text };
}
