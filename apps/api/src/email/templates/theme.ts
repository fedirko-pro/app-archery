/**
 * Email design tokens. All values are used to build inline styles at composition time,
 * so the final HTML still has inline styles for maximum email-client compatibility.
 * Colors are kept in sync with apps/web/src/theme/colors.ts.
 */
export const theme = {
  colors: {
    // Brand — keep in sync with frontend src/theme/colors.ts
    primary: '#000080', // navy
    primaryBright: '#0057b8',
    primaryDark: '#004a9e',
    accent: '#ffcc00', // yellow/gold
    text: '#333333',
    textPrimary: '#212121',
    textMuted: '#666666',
    border: '#e0e0e0',
    surface: '#f0f0f0',
    white: '#ffffff',
    // Success (e.g. approved state)
    successBg: '#d4edda',
    successBorder: '#c3e6cb',
    successText: '#155724',
    successHeading: '#28a745',
    // Danger (e.g. rejected state)
    dangerBg: '#f8d7da',
    dangerBorder: '#f5c6cb',
    dangerText: '#721c24',
    dangerHeading: '#dc3545',
    // Neutral (e.g. feedback block)
    neutralBg: '#f8f9fa',
    neutralBorder: '#6c757d',
  },
  sizes: {
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSmall: '12px',
    fontBody: '16px',
    fontHeading: '24px',
    maxWidth: '600px',
    spacingXs: '12px',
    spacingSm: '16px',
    spacingMd: '20px',
    spacingLg: '24px',
    spacingXl: '32px',
    radius: '8px',
  },
} as const;

/** Outer email wrapper style (full-width background). */
export function styleWrapper(): string {
  const { surface } = theme.colors;
  const { fontFamily } = theme.sizes;
  return `width: 100%; background-color: ${surface}; padding: 24px 0; font-family: ${fontFamily};`;
}

/** Centered email card style. */
export function styleCard(): string {
  const { white, border } = theme.colors;
  const { maxWidth, radius } = theme.sizes;
  return `max-width: ${maxWidth}; width: 100%; background-color: ${white}; border-radius: ${radius}; overflow: hidden; border: 1px solid ${border};`;
}

/** Inline style string for a centered content column inside the card. */
export function styleContent(): string {
  return `padding: 32px;`;
}

/** Inline style for the navy brand header bar. */
export function styleHeaderBrand(): string {
  const { primary } = theme.colors;
  return `background-color: ${primary}; padding: 20px 32px; text-align: center;`;
}

/** Inline style for header title text. */
export function styleHeaderTitle(): string {
  const { white } = theme.colors;
  return `font-size: 28px; font-weight: bold; color: ${white};`;
}

/** Inline style for main headings (e.g. h1). */
export function styleHeading(color?: string): string {
  const c = color ?? theme.colors.primary;
  const { fontHeading } = theme.sizes;
  return `margin: 0 0 20px 0; font-size: ${fontHeading}; line-height: 32px; font-weight: bold; color: ${c};`;
}

/** Inline style for body/paragraph text. */
export function styleBody(): string {
  const { text } = theme.colors;
  const { fontBody, fontFamily } = theme.sizes;
  return `margin: 0 0 16px 0; font-family: ${fontFamily}; font-size: ${fontBody}; line-height: 24px; color: ${text};`;
}

/** Inline style for muted/secondary text. */
export function styleMuted(): string {
  const { textMuted } = theme.colors;
  const { fontSmall, fontFamily } = theme.sizes;
  return `margin: 0 0 8px 0; font-family: ${fontFamily}; font-size: ${fontSmall}; line-height: 18px; color: ${textMuted};`;
}

/** Inline style for primary CTA button (applied to the inner <a>). */
export function styleButton(): string {
  const { primary, white } = theme.colors;
  const { fontFamily } = theme.sizes;
  return `display: inline-block; padding: 14px 32px; font-family: ${fontFamily}; font-size: 16px; font-weight: bold; color: ${white}; text-decoration: none; border-radius: 6px; background-color: ${primary}; border: 1px solid ${primary};`;
}

/**
 * Bulletproof CTA button table. Works reliably in Outlook and most webmail clients.
 */
export function buildButtonHtml(url: string, label: string): string {
  return `
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:32px 0;">
                  <tr>
                    <td align="center">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="border-radius:6px;" bgcolor="#000080">
                            <a href="${url}" style="${styleButton()}">${label}</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>`;
}

/** Inline style for centered block (e.g. button wrapper). */
export function styleBlockCenter(): string {
  return `text-align: center;`;
}

/** Inline style for link that may break (e.g. reset URL). */
export function styleLinkMuted(): string {
  return `word-break: break-all; color: ${theme.colors.textMuted};`;
}

/** Inline style for sign-off block. */
export function styleSignOff(): string {
  const { text } = theme.colors;
  const { fontBody, fontFamily } = theme.sizes;
  return `margin: 32px 0 0 0; font-family: ${fontFamily}; font-size: ${fontBody}; line-height: 24px; color: ${text};`;
}

/** Inline style for footer container. */
export function styleFooter(): string {
  const { neutralBg, border } = theme.colors;
  return `background-color: ${neutralBg}; padding: 24px 32px; text-align: center; border-top: 1px solid ${border};`;
}

/** Inline style for footer text. */
export function styleFooterText(): string {
  const { textMuted } = theme.colors;
  const { fontSmall, fontFamily } = theme.sizes;
  return `margin: 0 0 8px 0; font-family: ${fontFamily}; font-size: ${fontSmall}; line-height: 18px; color: ${textMuted};`;
}

/** Inline style for footer support link. */
export function styleFooterLink(): string {
  return `color: ${theme.colors.primary}; text-decoration: underline;`;
}

/** Inline style for horizontal rule above footer. */
export function styleHr(): string {
  const { spacingXl } = theme.sizes;
  const { border } = theme.colors;
  return `margin: ${spacingXl} 0; border: none; border-top: 1px solid ${border};`;
}

/** Inline style for success alert box. */
export function styleSuccessBox(): string {
  const { successBg, successBorder } = theme.colors;
  const { radius, spacingSm, spacingMd } = theme.sizes;
  return `background-color: ${successBg}; border: 1px solid ${successBorder}; border-radius: ${radius}; padding: ${spacingSm}; margin: ${spacingMd} 0;`;
}

/** Inline style for text inside success box. */
export function styleSuccessBoxText(): string {
  return `margin: 0; color: ${theme.colors.successText};`;
}

/** Inline style for danger alert box. */
export function styleDangerBox(): string {
  const { dangerBg, dangerBorder } = theme.colors;
  const { radius, spacingSm, spacingMd } = theme.sizes;
  return `background-color: ${dangerBg}; border: 1px solid ${dangerBorder}; border-radius: ${radius}; padding: ${spacingSm}; margin: ${spacingMd} 0;`;
}

/** Inline style for text inside danger box. */
export function styleDangerBoxText(): string {
  return `margin: 0; color: ${theme.colors.dangerText};`;
}

/** Inline style for neutral/feedback box. */
export function styleNeutralBox(): string {
  const { neutralBg, neutralBorder } = theme.colors;
  const { spacingXs, spacingSm, radius } = theme.sizes;
  return `background-color: ${neutralBg}; border-left: 4px solid ${neutralBorder}; border-radius: ${radius}; padding: ${spacingXs}; margin: ${spacingSm} 0;`;
}
