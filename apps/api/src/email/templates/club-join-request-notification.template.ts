import { EmailI18n, interpolate } from '../i18n';
import { buildButtonHtml, styleBody, styleHeading } from './theme';

export interface ClubJoinRequestNotificationParams {
  clubName: string;
  requesterName: string;
  requesterEmail: string;
  message?: string;
  reviewUrl: string;
}

export function getClubJoinRequestNotificationContent(
  params: ClubJoinRequestNotificationParams,
  t: EmailI18n,
): { html: string; text: string } {
  const { clubName, requesterName, requesterEmail, message, reviewUrl } = params;
  const s = t.clubJoinRequestNotification;

  const body = interpolate(s.body, { requesterName, requesterEmail, clubName });
  const messageBlock = message
    ? `<p style="${styleBody()}"><strong>${s.messageLabel}</strong> ${message}</p>`
    : '';

  const html = `
    <h2 style="${styleHeading()}">${s.heading}</h2>
    <p style="${styleBody()}">${interpolate(s.greeting, { clubName })}</p>
    <p style="${styleBody()}">${body}</p>
    ${messageBlock}
    ${buildButtonHtml(reviewUrl, s.reviewNote)}
  `;

  const text = `
${s.heading}

${interpolate(s.greeting, { clubName })}

${body}
${message ? `\n${s.messageLabel}: ${message}` : ''}

${s.reviewNote}: ${reviewUrl}
`.trim();

  return { html, text };
}
