import { buildFooterHtml, buildFooterText } from './partials/footer';
import { EMAIL_HEADER_HTML, EMAIL_HEADER_TEXT } from './partials/header';

export interface WrappedEmail {
  html: string;
  text: string;
}

/**
 * Wraps email content with shared header and footer.
 * Pass a translated `footerText` to localise the footer note.
 */
export function wrapEmail(
  contentHtml: string,
  contentText: string,
  footerText?: string,
): WrappedEmail {
  return {
    html: EMAIL_HEADER_HTML + contentHtml + buildFooterHtml(footerText),
    text: EMAIL_HEADER_TEXT + contentText + buildFooterText(footerText),
  };
}
