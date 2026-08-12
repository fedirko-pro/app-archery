import { styleFooter, styleFooterLink, styleFooterText } from '../theme';

const DEFAULT_FOOTER_TEXT =
  'This is an automated email from Sokil. Please do not reply to this message.';
const DEFAULT_SUPPORT_EMAIL = 'contact@sokil.app';

function buildLogoUrl(frontendUrl?: string): string {
  const base = frontendUrl?.replace(/\/$/, '') ?? '';
  return `${base}/logo192.png`;
}

export function buildFooterHtml(
  text: string,
  appDescription: string,
  supportLabel: string,
  supportAction: string,
  frontendUrl?: string,
  supportEmail?: string,
): string {
  const email = supportEmail ?? DEFAULT_SUPPORT_EMAIL;
  const logoUrl = buildLogoUrl(frontendUrl);
  const logoImg = frontendUrl
    ? `<table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin-bottom:16px;"><tr><td><img src="${logoUrl}" alt="Sokil" width="36" height="36" style="display:block;border:0;outline:none;text-decoration:none;border-radius:50%;opacity:0.8;-ms-interpolation-mode:bicubic;"></td></tr></table>`
    : '';

  return `
            <tr>
              <td style="${styleFooter()}">
                ${logoImg}
                <p style="${styleFooterText()}">${appDescription}</p>
                <p style="${styleFooterText()}">${text}</p>
                <p style="${styleFooterText()}">${supportLabel} <a href="mailto:${email}" style="${styleFooterLink()}">${supportAction}</a></p>
              </td>
            </tr>
`;
}

export function buildFooterText(
  text: string = DEFAULT_FOOTER_TEXT,
  appDescription?: string,
  supportLabel?: string,
  supportAction?: string,
  supportEmail?: string,
): string {
  const email = supportEmail ?? DEFAULT_SUPPORT_EMAIL;
  const descriptionLine = appDescription ? `\n${appDescription}` : '';
  const supportLine =
    supportLabel && supportAction ? `\n${supportLabel} ${supportAction}: ${email}` : '';
  return `\n\n────────────────────────────────────${descriptionLine}\n${text}${supportLine}`;
}
