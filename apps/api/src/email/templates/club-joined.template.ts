import type { EmailI18n } from '../i18n';
import { interpolate } from '../i18n';
import { theme, styleHeading, styleNeutralBox } from './theme';

export interface ClubJoinedContentParams {
  clubName: string;
  userName: string;
  profileUrl: string;
}

export function getClubJoinedContent(
  params: ClubJoinedContentParams,
  t: EmailI18n,
): { html: string; text: string } {
  const { clubName, userName, profileUrl } = params;
  const s = t.clubJoined;

  const greeting = interpolate(s.greeting, { clubName });
  const body = interpolate(s.body, { userName, clubName });

  const html = `
    <h2 style="${styleHeading()}">${s.heading}</h2>
    <p>${greeting}</p>
    <p>${body}</p>
    <div style="${styleNeutralBox()}">
      <p style="margin: 0; color: ${theme.colors.text};">
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
