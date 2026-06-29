import { describe, expect, it } from 'vitest';

import {
  getAvatarInitials,
  isExternalPlaceholderUrl,
  resolveClubLogo,
  resolveTournamentBanner,
  resolveUserAvatar,
  resolveUserAvatarWithCacheBust,
} from './placeholder-images';

describe('isExternalPlaceholderUrl', () => {
  it('returns false for null/undefined', () => {
    expect(isExternalPlaceholderUrl(null)).toBe(false);
    expect(isExternalPlaceholderUrl(undefined)).toBe(false);
  });

  it('returns true for i.pravatar.cc', () => {
    expect(isExternalPlaceholderUrl('https://i.pravatar.cc/150')).toBe(true);
  });

  it('returns true for picsum.photos', () => {
    expect(isExternalPlaceholderUrl('https://picsum.photos/200')).toBe(true);
  });

  it('returns true for placehold.co', () => {
    expect(isExternalPlaceholderUrl('https://placehold.co/300x200')).toBe(true);
  });

  it('returns true for via.placeholder.com', () => {
    expect(isExternalPlaceholderUrl('https://via.placeholder.com/150')).toBe(true);
  });

  it('returns true for images.unsplash.com', () => {
    expect(isExternalPlaceholderUrl('https://images.unsplash.com/photo-123')).toBe(true);
  });

  it('returns false for real image URLs', () => {
    expect(isExternalPlaceholderUrl('https://example.com/photo.jpg')).toBe(false);
  });

  it('returns false for invalid URLs', () => {
    expect(isExternalPlaceholderUrl('not-a-url')).toBe(false);
  });
});

describe('resolveUserAvatar', () => {
  it('returns undefined for null', () => {
    expect(resolveUserAvatar(null)).toBeUndefined();
  });

  it('returns undefined for placeholder URLs', () => {
    expect(resolveUserAvatar('https://i.pravatar.cc/150')).toBeUndefined();
  });

  it('returns the URL for real avatar', () => {
    const url = 'https://example.com/avatar.jpg';
    expect(resolveUserAvatar(url)).toBe(url);
  });
});

describe('resolveClubLogo', () => {
  it('returns local default for null', () => {
    const result = resolveClubLogo(null);
    expect(result).toBeDefined();
    expect(result).not.toBe('');
  });

  it('returns local default for placeholder URLs', () => {
    const result = resolveClubLogo('https://placehold.co/100');
    expect(result).toBeDefined();
  });

  it('returns URL for real logo', () => {
    const url = 'https://example.com/logo.png';
    expect(resolveClubLogo(url)).toBe(url);
  });
});

describe('resolveTournamentBanner', () => {
  it('returns local default for null', () => {
    const result = resolveTournamentBanner(null);
    expect(result).toBeDefined();
  });

  it('returns URL for real banner', () => {
    const url = 'https://example.com/banner.jpg';
    expect(resolveTournamentBanner(url)).toBe(url);
  });
});

describe('getAvatarInitials', () => {
  it('returns first + last initials uppercase', () => {
    expect(getAvatarInitials('john', 'doe')).toBe('JD');
  });

  it('handles missing first name', () => {
    expect(getAvatarInitials(undefined, 'Doe')).toBe('D');
  });

  it('handles missing last name', () => {
    expect(getAvatarInitials('John', undefined)).toBe('J');
  });

  it('returns ? for both missing', () => {
    expect(getAvatarInitials(undefined, undefined)).toBe('?');
  });

  it('handles empty strings', () => {
    expect(getAvatarInitials('', '')).toBe('?');
  });

  it('trims whitespace before taking first char', () => {
    expect(getAvatarInitials('  John', '  Doe')).toBe('JD');
  });
});

describe('resolveUserAvatarWithCacheBust', () => {
  it('returns undefined for null url', () => {
    expect(resolveUserAvatarWithCacheBust(null)).toBeUndefined();
  });

  it('appends cache bust param', () => {
    const result = resolveUserAvatarWithCacheBust('https://example.com/avatar.jpg', '2026-01-01');
    expect(result).toContain('t=2026-01-01');
    expect(result).toContain('?');
  });

  it('uses & when URL already has query params', () => {
    const result = resolveUserAvatarWithCacheBust(
      'https://example.com/avatar.jpg?size=100',
      '2026-01-01',
    );
    expect(result).toContain('&t=');
  });

  it('returns data: URLs unchanged', () => {
    const dataUrl = 'data:image/png;base64,abc123';
    expect(resolveUserAvatarWithCacheBust(dataUrl)).toBe(dataUrl);
  });
});
