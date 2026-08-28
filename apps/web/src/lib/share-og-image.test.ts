import { describe, expect, it } from 'vitest';

import {
  enlargeGoogleAvatarUrl,
  isOgImageProxyAllowed,
  isShareImageUrl,
  pickAchievementShareImage,
  resolveAchievementShareOgImage,
} from './share-og-image';

const SITE_URL = 'https://sokil.app';
const GOOGLE_AVATAR = 'https://lh3.googleusercontent.com/a/ACg8ocKexample=s96-c';

describe('isShareImageUrl', () => {
  it('rejects emoji and icon names', () => {
    expect(isShareImageUrl('🔥')).toBe(false);
    expect(isShareImageUrl('flame')).toBe(false);
    expect(isShareImageUrl('')).toBe(false);
    expect(isShareImageUrl(undefined)).toBe(false);
  });

  it('accepts http(s) images and local image paths', () => {
    expect(isShareImageUrl('https://cdn.example.com/badge.png')).toBe(true);
    expect(isShareImageUrl(GOOGLE_AVATAR)).toBe(true);
    expect(isShareImageUrl('/og/og-image-v2.png')).toBe(true);
  });

  it('rejects placeholder hosts and data URIs', () => {
    expect(isShareImageUrl('https://i.pravatar.cc/150')).toBe(false);
    expect(isShareImageUrl('data:image/png;base64,abc')).toBe(false);
  });
});

describe('enlargeGoogleAvatarUrl', () => {
  it('upsizes the Google avatar crop', () => {
    expect(enlargeGoogleAvatarUrl(GOOGLE_AVATAR)).toBe(
      'https://lh3.googleusercontent.com/a/ACg8ocKexample=s512-c',
    );
  });

  it('leaves non-Google URLs unchanged', () => {
    expect(enlargeGoogleAvatarUrl('https://cdn.example.com/a.png')).toBe(
      'https://cdn.example.com/a.png',
    );
  });
});

describe('isOgImageProxyAllowed', () => {
  it('allows Google avatar hosts over https', () => {
    expect(isOgImageProxyAllowed(GOOGLE_AVATAR)).toBe(true);
  });

  it('rejects other hosts', () => {
    expect(isOgImageProxyAllowed('https://evil.example/x.png')).toBe(false);
    expect(isOgImageProxyAllowed('http://lh3.googleusercontent.com/a/x=s96-c')).toBe(false);
  });
});

describe('pickAchievementShareImage', () => {
  it('prefers an achievement image over avatar and branded default', () => {
    expect(pickAchievementShareImage('https://cdn.example.com/badge.png', GOOGLE_AVATAR)).toBe(
      'https://cdn.example.com/badge.png',
    );
  });

  it('uses the avatar when the achievement icon is not an image', () => {
    expect(pickAchievementShareImage('🔥', GOOGLE_AVATAR)).toBe(GOOGLE_AVATAR);
  });

  it('falls back to the branded site image', () => {
    expect(pickAchievementShareImage('🔥', undefined)).toBe('/og/og-image-v2.png');
  });
});

describe('resolveAchievementShareOgImage', () => {
  it('uses the branded site image when neither source is a real picture', () => {
    expect(resolveAchievementShareOgImage('🔥', undefined, SITE_URL)).toBe(
      'https://sokil.app/og/og-image-v2.png',
    );
  });

  it('proxies Google avatars so chat crawlers can fetch them', () => {
    const result = resolveAchievementShareOgImage('🔥', GOOGLE_AVATAR, SITE_URL);
    expect(result.startsWith('https://sokil.app/og/share-image?src=')).toBe(true);
    expect(result).toContain(
      encodeURIComponent('https://lh3.googleusercontent.com/a/ACg8ocKexample=s512-c'),
    );
  });

  it('uses a same-origin uploaded avatar as-is', () => {
    const uploaded = 'https://api-archery.fedirko.pro/uploads/images/avatars/user.webp';
    expect(resolveAchievementShareOgImage('🏹', uploaded, SITE_URL)).toBe(uploaded);
  });
});
