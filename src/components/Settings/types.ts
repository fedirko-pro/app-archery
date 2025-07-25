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