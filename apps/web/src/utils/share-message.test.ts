import { describe, expect, it } from 'vitest';

import { buildShareBody, buildShareMessage } from './share-message';

describe('buildShareBody', () => {
  it('returns title only when text is undefined', () => {
    expect(buildShareBody('Hello')).toBe('Hello');
  });

  it('returns title only when text is empty', () => {
    expect(buildShareBody('Hello', '')).toBe('Hello');
  });

  it('returns title only when text is whitespace', () => {
    expect(buildShareBody('Hello', '   ')).toBe('Hello');
  });

  it('combines title and trimmed text', () => {
    expect(buildShareBody('Title', '  Description  ')).toBe('Title\n\nDescription');
  });
});

describe('buildShareMessage', () => {
  it('builds message with title, text, and url', () => {
    const result = buildShareMessage('Title', 'Body', 'https://example.com');
    expect(result).toBe('https://example.com\n\nTitle\n\nBody');
  });

  it('builds message without text', () => {
    const result = buildShareMessage('Title', undefined, 'https://example.com');
    expect(result).toBe('https://example.com\n\nTitle');
  });

  it('builds message with empty text', () => {
    const result = buildShareMessage('Title', '', 'https://example.com');
    expect(result).toBe('https://example.com\n\nTitle');
  });

  it('puts the page url before links written in the description', () => {
    const page = 'https://sokil.app/en/tournaments/1';
    const result = buildShareMessage('Title', 'Map\nhttps://maps.app.goo.gl/abc', page);
    expect(result.startsWith(page)).toBe(true);
    expect(result.indexOf(page)).toBeLessThan(result.indexOf('https://maps.app.goo.gl/abc'));
  });
});
