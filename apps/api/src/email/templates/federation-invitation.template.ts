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

export interface FederationInvitationContentParams {
  clubName: string;
  federationName: string;
  inviterName: string;
  acceptUrl: string;
}

export function getFederationInvitationContent(
  params: FederationInvitationContentParams,
  t: EmailI18n,
): { html: string; text: string } {
  const { clubName, federationName, inviterName, acceptUrl } = params;
  const s = t.federationInvitation;

  const greeting = interpolate(s.greeting, { federationName });
  const body = interpolate(s.body, { inviterName, federationName, clubName });

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
