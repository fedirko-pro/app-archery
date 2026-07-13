import type { AppLanguageCode } from './common';
import type { AuthProvider } from './auth';
import type { ProfileVisibility } from './profile';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  picture?: string;
  bio?: string;
  location?: string;
  country?: string;
  authProvider: AuthProvider | 'facebook';
  password?: string;
  createdAt: string;
  updatedAt: string;
  federationNumber?: string;
  nationality?: string;
  gender?: string;
  clubId?: string;
  club?: { id: string; name: string };
  categories?: string[];
  divisionId?: string;
  division?: { id: string; name: string };
  appLanguage?: AppLanguageCode;
  app_language?: AppLanguageCode;
  language?: AppLanguageCode;
  syncTrainingsAndEquipment?: boolean;
  profileVisibility?: ProfileVisibility;
  onboardingCompletedAt?: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  authProvider: 'local';
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
}
