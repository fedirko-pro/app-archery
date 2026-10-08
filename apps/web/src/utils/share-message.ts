/** Body text shared across native share, WhatsApp, Telegram, email, etc. */
export function buildShareBody(title: string, text?: string): string {
  const trimmed = text?.trim();
  if (trimmed) {
    return `${title}\n\n${trimmed}`;
  }
  return title;
}

export function buildShareMessage(title: string, text: string | undefined, url: string): string {
  return `${url}\n\n${buildShareBody(title, text)}`;
}
