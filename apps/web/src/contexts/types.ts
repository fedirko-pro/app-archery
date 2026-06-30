import type { LoginCredentials, RegisterData, ChangePasswordData, AuthResponse, User } from '@sokil/shared-types';

export type {
  LoginCredentials,
  RegisterData,
  ChangePasswordData,
  AuthResponse,
  User,
};

export type { AppLanguageCode } from '@sokil/shared-types';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (userData: RegisterData) => Promise<User>;
  changePassword: (passwordData: ChangePasswordData) => Promise<void>;
  setPassword: (password: string, confirmPassword: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: User) => void;
  handleGoogleAuth: () => Promise<void>;
  clearError: () => void;
  isAuthenticated: boolean;
}
