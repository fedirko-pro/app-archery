/** Body text shared across native share, WhatsApp, Telegram, email, etc. */
export function buildShareBody(title: string, text?: string): string {
  const trimmed = text?.trim();
  if (trimmed) {
    return `${title}\n\n${trimmed}`;
  }
  return title;
}

/** Full message including URL (for platforms that take a single text field). */
export function buildShareMessage(title: string, text: string | undefined, url: string): string {
  return `${buildShareBody(title, text)}\n\n${url}`;
}
