import { describe, expect, it } from 'vitest';

import { buildShareLinks } from './share-links';

describe('buildShareLinks', () => {
  const url = 'https://example.com/tournament/123';
  const title = 'Spring Tournament';
  const text = 'Join us!';

  it('builds all platform links', () => {
    const links = buildShareLinks(url, title, text);
    expect(Object.keys(links)).toEqual([
      'whatsapp',
      'telegram',
      'facebook',
      'twitter',
      'linkedin',
      'email',
    ]);
  });

  it('builds correct whatsapp link', () => {
    const links = buildShareLinks(url, title, text);
    expect(links.whatsapp).toContain('wa.me');
    expect(links.whatsapp).toContain(encodeURIComponent(url));
  });

  it('builds correct telegram link', () => {
    const links = buildShareLinks(url, title, text);
    expect(links.telegram).toContain('t.me/share/url');
    expect(links.telegram).toContain(`url=${encodeURIComponent(url)}`);
  });

  it('builds correct facebook link', () => {
    const links = buildShareLinks(url, title, text);
    expect(links.facebook).toContain('facebook.com/sharer');
    expect(links.facebook).toContain(encodeURIComponent(url));
  });

  it('builds correct email link with subject', () => {
    const links = buildShareLinks(url, title, text);
    expect(links.email).toContain('mailto:?');
    expect(links.email).toContain(`subject=${encodeURIComponent(title)}`);
  });

  it('handles URL with special characters', () => {
    const specialUrl = 'https://example.com/path?a=1&b=2';
    const links = buildShareLinks(specialUrl, title);
    expect(links.whatsapp).toContain(encodeURIComponent(specialUrl));
  });
});
