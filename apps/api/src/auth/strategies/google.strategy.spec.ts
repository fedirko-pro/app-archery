import { ConflictException } from '@nestjs/common';
import type { Profile } from 'passport-google-oauth20';

import { AuthProviders } from '../../user/types';
import { GoogleStrategy } from './google.strategy';

jest.mock('@nestjs/passport', () => ({
  PassportStrategy: () =>
    class MockPassportStrategy {
      constructor(..._args: unknown[]) {}
    },
}));

describe('GoogleStrategy', () => {
  let strategy: GoogleStrategy;
  let userService: {
    findByEmail: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };

  const googleProfile = {
    id: 'google-123',
    emails: [{ value: 'user@example.com' }],
    name: { givenName: 'Test', familyName: 'User' },
    photos: [{ value: 'https://example.com/photo.jpg' }],
  } as Profile;

  beforeEach(() => {
    userService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    strategy = new GoogleStrategy(
      {
        get: jest.fn((key: string) => {
          const values: Record<string, string> = {
            GOOGLE_CLIENT_ID: 'client-id',
            GOOGLE_CLIENT_SECRET: 'client-secret',
            GOOGLE_CALLBACK_URL: 'http://localhost/callback',
          };
          return values[key];
        }),
      } as never,
      userService as never,
    );
  });

  it('rejects sign-in when a local account already uses the email', async () => {
    userService.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      authProvider: AuthProviders.Local,
    });

    const done = jest.fn();
    await strategy.validate('access', 'refresh', googleProfile, done);

    expect(done).toHaveBeenCalledWith(expect.any(ConflictException), false);
    expect((done.mock.calls[0][0] as ConflictException).message).toContain('password');
    expect(userService.create).not.toHaveBeenCalled();
  });

  it('creates a Google user when no account exists', async () => {
    const createdUser = {
      id: 'user-2',
      email: 'user@example.com',
      authProvider: AuthProviders.Google,
    };
    userService.findByEmail.mockResolvedValue(null);
    userService.create.mockResolvedValue(createdUser);

    const done = jest.fn();
    await strategy.validate('access', 'refresh', googleProfile, done);

    expect(userService.create).toHaveBeenCalled();
    expect(done).toHaveBeenCalledWith(null, { user: createdUser });
  });

  it('updates picture and googleId for existing Google users', async () => {
    const existingUser = {
      id: 'user-3',
      email: 'user@example.com',
      authProvider: AuthProviders.Google,
      picture: 'https://example.com/old.jpg',
      googleId: 'old-google-id',
    };
    const updatedUser = {
      ...existingUser,
      picture: 'https://example.com/photo.jpg',
      googleId: 'google-123',
    };

    userService.findByEmail.mockResolvedValue(existingUser);
    userService.update.mockResolvedValue(updatedUser);

    const done = jest.fn();
    await strategy.validate('access', 'refresh', googleProfile, done);

    expect(userService.update).toHaveBeenCalledWith('user-3', {
      picture: 'https://example.com/photo.jpg',
      googleId: 'google-123',
    });
    expect(done).toHaveBeenCalledWith(null, { user: updatedUser });
  });
});
