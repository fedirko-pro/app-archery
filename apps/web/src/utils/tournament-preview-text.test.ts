import { describe, expect, it } from 'vitest';

import { firstParagraph, tournamentPreviewText } from './tournament-preview-text';

describe('firstParagraph', () => {
  it('returns text before the first blank line', () => {
    const text = ['Historical bow tournament.', 'Open to FABP athletes.', '', 'Local: Tomar'].join(
      '\n',
    );
    expect(firstParagraph(text)).toBe('Historical bow tournament.\nOpen to FABP athletes.');
  });

  it('returns an empty string when there is no text', () => {
    expect(firstParagraph('  \n  ')).toBe('');
    expect(firstParagraph(undefined)).toBe('');
  });
});

describe('tournamentPreviewText', () => {
  it('prefers the short description', () => {
    expect(tournamentPreviewText('Short', 'Full first paragraph.\n\nMore')).toBe('Short');
  });

  it('uses the first paragraph when the short description is empty', () => {
    expect(tournamentPreviewText('  ', 'First paragraph.\n\nSchedule')).toBe('First paragraph.');
    expect(tournamentPreviewText(null, 'First paragraph.\n\nSchedule')).toBe('First paragraph.');
  });
});
