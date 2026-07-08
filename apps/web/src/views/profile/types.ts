import type { AppLanguage } from '../../utils/i18n-lang';

export interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  location: string;
  country?: string;
  picture: string;
  federationNumber?: string;
  nationality?: string;
  gender?: string;
  clubId?: string;
  categories?: string[];
  divisionId?: string;
  division?: { id: string; name: string };
  role?: string;
  appLanguage?: AppLanguage;
  syncTrainingsAndEquipment?: boolean;
  profileVisibility?: 'personal' | 'limited' | 'public';
  onboardingCompletedAt?: string | null;
}

export interface PasswordChangeForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordValidation {
  currentPasswordError: boolean;
  currentPasswordMessage: string;
  newPasswordError: boolean;
  newPasswordMessage: string;
  confirmPasswordError: boolean;
  confirmPasswordMessage: string;
}
