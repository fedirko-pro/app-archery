export const AuthProviders = {
  Local: 'local',
  Google: 'google',
} as const;

export type AuthProvider = (typeof AuthProviders)[keyof typeof AuthProviders];
