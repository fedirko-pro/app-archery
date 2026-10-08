export function firstParagraph(text?: string | null): string {
  const trimmed = text?.trim() ?? '';
  if (!trimmed) {
    return '';
  }
  return trimmed.split(/\n\s*\n/)[0]?.trim() ?? '';
}

export function tournamentPreviewText(
  shortDescription?: string | null,
  description?: string | null,
): string {
  const short = shortDescription?.trim() ?? '';
  if (short) {
    return short;
  }
  return firstParagraph(description);
}
