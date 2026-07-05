import type { EmailI18n } from '../i18n';
import { interpolate } from '../i18n';
import {
  theme,
  styleHeading,
  styleButton,
  styleBlockCenter,
  styleLinkMuted,
  styleNeutralBox,
} from './theme';

export interface ClubInvitationContentParams {
  clubName: string;
  inviterName: string;
  acceptUrl: string;
}

export function getClubInvitationContent(
  params: ClubInvitationContentParams,
  t: EmailI18n,
): { html: string; text: string } {
  const { clubName, inviterName, acceptUrl } = params;
  const s = t.clubInvitation;

  const greeting = interpolate(s.greeting, { clubName });
  const body = interpolate(s.body, { inviterName, clubName });

  const html = `
    <h2 style="${styleHeading()}">${s.heading}</h2>
    <p>${greeting}</p>
    <p>${body}</p>
    <div style="${styleBlockCenter()}">
      <a href="${acceptUrl}"
         style="${styleButton()}">
        ${s.ctaLabel}
      </a>
    </div>
    <p>${s.linkFallback}</p>
    <p style="${styleLinkMuted()}">${acceptUrl}</p>
    <div style="${styleNeutralBox()}">
      <p style="margin: 0; color: ${theme.colors.text};">
        ${s.ignoreNote}
      </p>
    </div>
  `;

  const text = `
${s.heading}

${greeting}

${body}

${acceptUrl}

${s.ignoreNote}
`.trim();

  return { html, text };
}
