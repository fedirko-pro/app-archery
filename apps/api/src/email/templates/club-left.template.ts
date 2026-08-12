import { EmailI18n, interpolate } from '../i18n';
import { buildButtonHtml, styleBody, styleHeading } from './theme';

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
    <p style="${styleBody()}">${greeting}</p>
    <p style="${styleBody()}">${body}</p>
    ${buildButtonHtml(profileUrl, s.viewProfile)}
  `;

  const text = `
${s.heading}

${greeting}

${body}

${s.viewProfile}: ${profileUrl}
`.trim();

  return { html, text };
}
