import type { EmailI18n } from '../i18n';
import { interpolate } from '../i18n';
import { styleHeading, styleNeutralBox } from './theme';

export interface ClubJoinRequestApprovedParams {
  name: string;
  clubName: string;
  profileUrl: string;
}

export function getClubJoinRequestApprovedContent(
  params: ClubJoinRequestApprovedParams,
  t: EmailI18n,
): { html: string; text: string } {
  const { name, clubName, profileUrl } = params;
  const s = t.clubJoinRequestApproved;
  const greeting = interpolate(s.greeting, { name });

  const html = `
    <h2 style="${styleHeading()}">${s.heading}</h2>
    <p>${greeting}</p>
    <p>${interpolate(s.body, { clubName })}</p>
    <div style="${styleNeutralBox()}">
      <p style="margin: 0;">${interpolate(s.profileNote, { profileUrl })}</p>
    </div>
  `;

  const text = `
${s.heading}

${greeting}

${interpolate(s.body, { clubName })}

${profileUrl}
`.trim();

  return { html, text };
}
