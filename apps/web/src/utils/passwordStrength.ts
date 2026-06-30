/**
 * Shared password strength scorer.
 * Returns a label and a semantic CSS color (mapped to MUI palette defaults for
 * error / warning / info / success so they stay consistent with the theme).
 */
export interface PasswordStrengthResult {
  strength: string;
  color: string;
}

export const getPasswordStrength = (password: string): PasswordStrengthResult => {
  if (!password) return { strength: '', color: '' };

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const { length } = password;

  const score =
    [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length +
    (length >= 8 ? 1 : 0) +
    (length >= 12 ? 1 : 0);

  if (score <= 2) return { strength: 'Weak', color: '#d32f2f' }; // theme error.main
  if (score <= 4) return { strength: 'Fair', color: '#ed6c02' }; // theme warning.main
  if (score <= 6) return { strength: 'Good', color: '#0288d1' }; // theme info.main
  return { strength: 'Strong', color: '#2e7d32' }; // theme success.main
};
