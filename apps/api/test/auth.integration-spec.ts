import { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import request from 'supertest';

import {
  AuthIntegrationMocks,
  createAuthIntegrationApp,
} from './helpers/create-auth-integration-app';

jest.mock('bcryptjs');

describe('Auth integration', () => {
  let app: INestApplication;
  let mocks: AuthIntegrationMocks;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    password: 'hashed-password',
    role: 'user',
    appLanguage: 'en',
    authProvider: 'local',
  };

  beforeEach(async () => {
    const fixture = await createAuthIntegrationApp();
    app = fixture.app;
    mocks = fixture.mocks;
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /auth/login creates a session for valid credentials', async () => {
    mocks.userService.findByEmail.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    await request(app.getHttpServer())
      .post('/auth/login')
      .set('User-Agent', 'jest-integration')
      .send({ email: 'test@example.com', password: 'correct-password' })
      .expect(201)
      .expect(({ body }) => {
        expect(body.user.email).toBe('test@example.com');
      });

    expect(mocks.sessionService.createSession).toHaveBeenCalledWith(
      mockUser,
      expect.any(Object),
      expect.objectContaining({
        userAgent: 'jest-integration',
        ipAddress: expect.any(String),
      }),
    );
  });

  it('POST /auth/login rejects invalid credentials', async () => {
    mocks.userService.findByEmail.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'wrong-password' })
      .expect(401);
  });
});
