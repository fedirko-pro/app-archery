import { EmailI18n, interpolate } from '../i18n';
import {
  buildButtonHtml,
  styleBody,
  styleHeading,
  styleLinkMuted,
  styleNeutralBox,
  theme,
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
    <p style="${styleBody()}">${greeting}</p>
    <p style="${styleBody()}">${body}</p>
    ${buildButtonHtml(acceptUrl, s.ctaLabel)}
    <p style="${styleBody()}">${s.linkFallback}</p>
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
