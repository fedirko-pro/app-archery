import { styleHeaderBrand, styleHeaderTitle } from '../theme';

const DEFAULT_LOGO_WIDTH = 48;
const DEFAULT_LOGO_HEIGHT = 48;

function buildLogoUrl(frontendUrl?: string): string {
  const base = frontendUrl?.replace(/\/$/, '') ?? '';
  return `${base}/logo192.png`;
}

/**
 * Shared email header (HTML). Used inside the layout wrapper.
 * If `frontendUrl` is provided, the Sokil logo is referenced from the public folder.
 */
export function buildHeaderHtml(frontendUrl?: string): string {
  const logoUrl = buildLogoUrl(frontendUrl);
  const logoImg = frontendUrl
    ? `<img src="${logoUrl}" alt="Sokil" width="${DEFAULT_LOGO_WIDTH}" height="${DEFAULT_LOGO_HEIGHT}" style="display:block; border:0; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic;">`
    : '';

  return `
            <tr>
              <td style="${styleHeaderBrand()}">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center">
                  <tr>
                    ${frontendUrl ? `<td style="padding-right:12px;">${logoImg}</td>` : ''}
                    <td style="vertical-align:middle;">
                      <span style="${styleHeaderTitle()}">Sokil</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
`;
}

export const EMAIL_HEADER_TEXT = `Sokil\n${'─'.repeat(40)}\n\n`;
