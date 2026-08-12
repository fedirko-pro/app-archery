import { EmailI18n, interpolate } from '../i18n';
import { buildButtonHtml, styleBody, styleHeading } from './theme';

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
    <p style="${styleBody()}">${greeting}</p>
    <p style="${styleBody()}">${interpolate(s.body, { clubName })}</p>
    ${buildButtonHtml(profileUrl, s.profileNote)}
  `;

  const text = `
${s.heading}

${greeting}

${interpolate(s.body, { clubName })}

${s.profileNote}: ${profileUrl}
`.trim();

  return { html, text };
}
