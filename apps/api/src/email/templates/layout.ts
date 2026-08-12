import { buildFooterHtml, buildFooterText } from './partials/footer';
import { buildHeaderHtml, EMAIL_HEADER_TEXT } from './partials/header';
import { styleCard, styleSignOff, styleWrapper } from './theme';

export interface WrappedEmail {
  html: string;
  text: string;
}

export interface WrapEmailOptions {
  contentHtml: string;
  contentText: string;
  footerText: string;
  appDescription: string;
  supportLabel: string;
  supportAction: string;
  signOff: string;
  teamName: string;
  previewText?: string;
  frontendUrl?: string;
  supportEmail?: string;
}

/**
 * Wraps email content with a branded email shell and produces
 * both an HTML email and a plain-text alternative.
 */
export function wrapEmail(options: WrapEmailOptions): WrappedEmail {
  const {
    contentHtml,
    contentText,
    footerText,
    appDescription,
    supportLabel,
    supportAction,
    signOff,
    teamName,
    previewText,
    frontendUrl,
    supportEmail,
  } = options;

  const preview = previewText
    ? `\n  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${previewText}</div>`
    : '';

  const signOffHtml = `<p style="${styleSignOff()}">${signOff}<br><strong>${teamName}</strong></p>`;
  const signOffText = `\n\n${signOff}\n${teamName}`;

  const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <meta name="x-apple-disable-message-reformatting">
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>@media (prefers-color-scheme: dark){.email-wrapper{background-color:#1a1a1a!important;}.email-card{background-color:#ffffff!important;}}</style>
</head>
<body style="margin:0;padding:0;word-spacing:normal;">${preview}
  <div class="email-wrapper" role="article" aria-roledescription="email" lang="en" style="${styleWrapper()}">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <table class="email-card" role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="${styleCard()}">
            ${buildHeaderHtml(frontendUrl)}
            <tr>
              <td style="padding:32px;">
                ${contentHtml}
                ${signOffHtml}
              </td>
            </tr>
            ${buildFooterHtml(footerText, appDescription, supportLabel, supportAction, frontendUrl, supportEmail)}
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;

  const text = `${EMAIL_HEADER_TEXT}${contentText}${signOffText}${buildFooterText(footerText, appDescription, supportLabel, supportAction, supportEmail)}`;

  return { html, text };
}
