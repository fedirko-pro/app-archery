import type {
  LoginCredentials,
  RegisterData,
  ChangePasswordData,
  AuthResponse,
  User,
} from '@sokil/shared-types';

export type { LoginCredentials, RegisterData, ChangePasswordData, AuthResponse, User };

export type { AppLanguageCode } from '@sokil/shared-types';

export interface AuthContextType {
  user: User | null;
  /** True only during the initial auth check on app load. */
  initializing: boolean;
  /** True during login, register, password, and OAuth actions. */
  actionLoading: boolean;
  /** @deprecated Prefer `initializing` or `actionLoading`. */
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
