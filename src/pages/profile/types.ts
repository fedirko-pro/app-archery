export interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  location: string;
  website: string;
  picture: string;
  federationNumber?: string;
  categories?: string[];
  role?: string;
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