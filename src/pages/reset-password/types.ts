export interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordValidation {
  passwordError: boolean;
  passwordMessage: string;
  confirmPasswordError: boolean;
  confirmPasswordMessage: string;
}
