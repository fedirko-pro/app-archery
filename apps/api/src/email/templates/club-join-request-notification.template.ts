import type { EmailI18n } from '../i18n';
import { interpolate } from '../i18n';
import { theme, styleHeading, styleNeutralBox } from './theme';

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
  const messageBlock = message ? `<p><strong>${s.messageLabel}</strong> ${message}</p>` : '';

  const html = `
    <h2 style="${styleHeading()}">${s.heading}</h2>
    <p>${interpolate(s.greeting, { clubName })}</p>
    <p>${body}</p>
    ${messageBlock}
    <div style="${styleNeutralBox()}">
      <p style="margin: 0; color: ${theme.colors.text};">
        ${interpolate(s.reviewNote, { reviewUrl })}
      </p>
    </div>
  `;

  const text = `
${s.heading}

${interpolate(s.greeting, { clubName })}

${body}
${message ? `\n${s.messageLabel}: ${message}` : ''}

${reviewUrl}
`.trim();

  return { html, text };
}
