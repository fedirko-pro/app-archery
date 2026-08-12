import { EmailI18n } from '../i18n';
import { buildButtonHtml, styleBody, styleHeading, styleLinkMuted } from './theme';

export interface PasswordResetContentParams {
  resetUrl: string;
}

export function getPasswordResetContent(
  params: PasswordResetContentParams,
  t: EmailI18n,
): { html: string; text: string } {
  const { resetUrl } = params;
  const s = t.passwordReset;

  const html = `
    <h2 style="${styleHeading()}">${s.heading}</h2>
    <p style="${styleBody()}">${s.hello}</p>
    <p style="${styleBody()}">${s.body}</p>
    ${buildButtonHtml(resetUrl, s.ctaLabel)}
    <p style="${styleBody()}">${s.linkFallback}</p>
    <p style="${styleLinkMuted()}">${resetUrl}</p>
    <p style="${styleBody()}">${s.expiry}</p>
    <p style="${styleBody()}">${s.ignoreNote}</p>
  `;

  const text = `
${s.heading}

${s.hello}

${s.body}

${resetUrl}

${s.expiry}

${s.ignoreNote}
`.trim();

  return { html, text };
}
